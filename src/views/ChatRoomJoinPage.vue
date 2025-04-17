<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-center text-h5">채팅</v-card-title>
          <v-card-text>
            <div class="chat-box">
              <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="['chat-message', msg.sender === senderNickname ? 'sent' : 'received']"
              >
                <strong>{{ msg.sender }}:</strong> {{ msg.message }}
              </div>
            </div>
            <!-- 기가 막히게 아래로 내려가는 버튼 -->
            <v-btn
              v-if="showScrollButton"
              class="scroll-to-bottom-btn"
              color="primary"
              @click="scrollToBottom"
            >
              ⬇ 새 메시지 보기
            </v-btn>
            
            <v-alert
              v-if="newMessageNotice"
              class="new-message-alert"
              type="info"
              dense
              outlined
              style="position: absolute; bottom: 70px; left: 50%; transform: translateX(-50%); z-index: 20;"
            >
              {{ newMessageNotice }}
            </v-alert>


            <!-- 로그인한 사용자만 메시지 입력 -->
            <div v-if="isLogin">
              <v-text-field
                v-model="newMessage"
                label="메시지 입력"
                @keyup.enter="sendMessage"
              />
              <v-btn color="primary" block @click="sendMessage">전송</v-btn>
            </div>
            <div v-else class="text-center text-caption mt-2">
              로그인한 사용자만 메시지를 보낼 수 있어요.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SockJS from "sockjs-client";
import Stomp from 'webstomp-client';
import axios from 'axios';

export default {
  data() {
    return {
      messages: [],
      newMessage: '',
      stompClient: null,
      roomId: 1,    //하드코딩 우선 이렇게 했습니다.
      token: '',
      userId: null,
      senderNickname: null,
      isLogin: false,
      isConnected: false,
      showScrollButton: false,
      newMessageNotice: null,
    };
  },
  // async created() {
  //   this.token = localStorage.getItem('token');
  //   if(this.token){
  //       this.isLogin = true;
  //   }
  //   console.log("token:", this.token, typeof this.token, isNaN(this.token));
  //   this.isLogin = !!this.token;
  //   this.roomId = 1;
  //   console.log(this.roomId);
    
  //   if (this.token) {
  //     try {
  //       await axios.post(
  //         `${process.env.VUE_APP_API_BASE_URL}/streaming-service/chat/room/join/${this.roomId}`,
  //         {},
  //         {
  //           headers: {
  //             Authorization: `Bearer ${this.token}`,
  //           },
  //         }
  //       );
  //     } catch (err) {
  //       console.error("채팅방 참여 실패:", err);
  //     }
  //   } else {
  //     console.log("토큰 들어오는지 함 보자자", this.token);
  //   }
  //   this.connectWebsocket();
  // },
  async created() {
    await this.prepareToken();
    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/streaming-service/chat/history/${this.roomId}`);
    this.messages = response.data;
    await this.joinChatRoom();
    this.connectWebsocket();
  },
  beforeRouteLeave(to, from, next) {
    this.disconnectWebSocket();
    next();
  },
  mounted() {
    this.$nextTick(() => {
      const chatBox = this.$el.querySelector('.chat-box');
      if (chatBox) {
        chatBox.addEventListener('scroll', this.checkScrollPosition);
      }
    });
  },
  beforeUnmount() {
    const chatBox = this.$el.querySelector('.chat-box');
    if (chatBox) {
      chatBox.removeEventListener('scroll', this.checkScrollPosition);
    }

    this.disconnectWebSocket();
  },
//   methods: {
//     connectWebsocket() {
//       if (this.stompClient && this.stompClient.connected) return;

//       const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/streaming-service/connect`);
//       this.stompClient = Stomp.over(sockJs);

//       this.stompClient.connect({}, () => {
//         console.log("✅ WebSocket 연결 성공");

//         // 연결 이후 첫 메시지로 인증 처리
//         this.stompClient.send(
//           "/publish/auth",
//           { Authorization: `Bearer ${this.token}` },
//           '{}'
//         );

//         this.stompClient.subscribe(`/topic/${this.roomId}`, message => {
//           console.log("📩 메시지 수신", message.body);
//         });
//       });
//     },
//     sendMessage() {
//       console.log('🟡 sendMessage() 호출됨');
//       if (!this.newMessage.trim()) return;
//       if (!this.stompClient || !this.stompClient.connected){
//         console.warn('❌ stompClient 미연결 상태');
//        return;
//       }
//       const message = {
//         message: this.newMessage,
//         type: 'TALK',
//       };

//       this.stompClient.send(
//         `/publish/${this.roomId}`,
//         {
//           Authorization: `Bearer ${this.token}`
//         },
//         JSON.stringify(message)
//       );
//       console.log('메시지 전송 완료:', message);
//         this.newMessage = '';
//     },
//     scrollToBottom() {
//       this.$nextTick(() => {
//         const chatBox = this.$el.querySelector('.chat-box');
//         if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
//       });
//     },
//     async disconnectWebSocket() {
//       if (this.stompClient && this.stompClient.connected) {
//         this.stompClient.disconnect();
//       }
//     },
//   },
// };
methods: {
    async prepareToken() {
      this.token = localStorage.getItem('token');
      this.isLogin = !!this.token;
      console.log("token:", this.token);
    },
    async joinChatRoom() {
      if (!this.token) return;
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/streaming-service/chat/room/join/${this.roomId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );
        console.log('채팅방 입장');
      } catch (err) {
        console.error("❌❌❌ 채팅방 참여 실패:", err);
      }
    },
    connectWebsocket() {
      console.log("connect 시작")
      if (this.stompClient && this.stompClient.connected) return;

      const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/streaming-service/connect`);
      this.stompClient = Stomp.over(sockJs);
      this.stompClient.debug = str => console.log("📡 STOMP DEBUG:", str); // 디버깅용

      this.stompClient.connect({}, () => {
        console.log("WebSocket 연결 성공");
        this.isConnected = true;

        this.stompClient.subscribe(`/topic/${this.roomId}`, (message) => {
          try {
            console.log('메시지 수신:', message.body);
            const parsed = JSON.parse(message.body);
            this.messages.push(parsed);          

            this.$nextTick(() => {
              const chatBox = this.$el.querySelector('.chat-box');
              if (!chatBox) return;

              const isAtBottom =
                chatBox.scrollTop + chatBox.clientHeight >= chatBox.scrollHeight - 50;

              if (isAtBottom) {
                this.scrollToBottom();
                this.newMessageNotice = null;
              } else {
                this.showScrollButton = true;
                this.newMessageNotice = parsed.message; // 새 메시지 보여줌
              }
            });
          } catch (err) {
            console.error("❌❌❌ 메시지 파싱 실패:", err, message);
          }
        });
      }, (err) => {
        console.error("❌❌❌ WebSocket 연결 실패:", err);
        this.isConnected = false;

        setTimeout(() => {
        console.log("WebSocket 재연결 시도 중@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        this.connectWebsocket();
        }, 3000);
      });
    },
    sendMessage() {
      console.log('sendMessage() 호출 시작');

      if (!this.newMessage.trim()) return;
      if (!this.stompClient || !this.stompClient.connected || !this.isConnected) {
        console.warn('❌❌❌ stompClient 미연결 상태');
        return;
      }

      const message = {
        message: this.newMessage,
        type: 'TALK',
      };

      const jsonMessage = JSON.stringify(message);
      console.log("✅ 최종 전송 JSON 문자열:", jsonMessage);

      this.stompClient.send( `/publish/${this.roomId}`, jsonMessage, { Authorization: `Bearer ${this.token}` } );
      console.log('메시지 전송 완료, 내용용:', message);
      this.newMessage = '';

      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$el.querySelector('.chat-box');
        if (chatBox) {
          chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
          });
          this.showScrollButton = false;
          this.newMessageNotice = null;
        }
      });
    },
    checkScrollPosition() {
      const chatBox = this.$el.querySelector('.chat-box');
      if (!chatBox) return;

      const threshold = 50; // 여유 범위
      const nearBottom =
        chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < threshold;

      this.showScrollButton = !nearBottom;
    },
    disconnectWebSocket() {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.disconnect(() => {
          console.log("WebSocket 연결 종료");
          this.isConnected = false;
        });
      } else{
        this.isConnected = false;
      }
    },
  },
};
</script>

<style>
.chat-box {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  margin-bottom: 10px;
}
.chat-message {
  margin-bottom: 10px;
}
.sent {
  text-align: right;
}
.received {
  text-align: left;
}
.scroll-to-bottom-btn {
  position: absolute;
  bottom: 80px; /* 채팅 입력창 위에 뜨게 */
  right: 30px;
  z-index: 10;
}
.scroll-to-bottom-btn {
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 999;
  opacity: 0.9;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
}
</style>