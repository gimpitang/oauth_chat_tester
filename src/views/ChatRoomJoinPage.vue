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
    await this.joinChatRoom();
    this.connectWebsocket();
  },
  beforeRouteLeave(to, from, next) {
    this.disconnectWebSocket();
    next();
  },
  beforeUnmount() {
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
          } catch (err) {
            console.error("❌❌❌ 메시지 파싱 실패:", err, message);
          }
        });
      }, (err) => {
        console.error("❌❌❌ WebSocket 연결 실패:", err);
      });
    },
    sendMessage() {
      console.log('sendMessage() 호출 시작작');

      if (!this.newMessage.trim()) return;
      if (!this.stompClient || !this.stompClient.connected || !this.isConnected) {
        console.warn('❌❌❌ stompClient 미연결 상태');
        return;
      }

      const message = {
        message: this.newMessage,
        type: 'TALK',
      };

      this.stompClient.send(
        `/publish/${this.roomId}`,
        {
          Authorization: `Bearer ${this.token}`
        },
        JSON.stringify(message)
      );
      console.log('메시지 전송 완료, 내용용:', message);
      this.newMessage = '';
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$el.querySelector('.chat-box');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      });
    },
    disconnectWebSocket() {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.disconnect(() => {
          console.log("WebSocket 연결 종료");
          this.isConnected = false;
        });
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
</style>