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
import SockJS from 'sockjs-client';
import Stomp from 'webstomp-client';
import axios from 'axios';

export default {
  data() {
    return {
      messages: [],
      newMessage: '',
      stompClient: null,
      roomId: null,
      token: '',
      userId: null,
      senderNickname: null,
      isLogin: false,
    };
  },
  async created() {
    this.token = localStorage.getItem('token');
    if(this.token){
        this.isLogin = true;
    }
    console.log("token:", this.token, typeof this.token, isNaN(this.token));
    this.isLogin = !!this.token;
    this.roomId = 1;
    console.log(this.roomId);
    
    if (this.token) {
      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/chat/room/join/${this.roomId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );
      } catch (err) {
        console.error("채팅방 참여 실패:", err);
      }
    } else {
      console.log("토큰 들어오는지 함 보자자", this.token);
    }

  },
  beforeRouteLeave(to, from, next) {
    this.disconnectWebSocket();
    next();
  },
  beforeUnmount() {
    this.disconnectWebSocket();
  },
  methods: {
    connectWebsocket() {
      if (this.stompClient && this.stompClient.connected) return;

      const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/connect`);
      this.stompClient = Stomp.over(sockJs);

      const headers = this.isLogin
        ? {
            Authorization: `Bearer ${this.token}` 
          }
        : {};

      this.stompClient.connect(
        headers,
        () => {
          this.stompClient.subscribe(`/topic/${this.roomId}`, (message) => {
            const parsed = JSON.parse(message.body);
            this.messages.push(parsed);
            this.scrollToBottom();
          });
        },
        (error) => {
          console.error('WebSocket 연결 실패:', error);
        }
      );
    },
    sendMessage() {
      if (!this.newMessage.trim()) return;
      if (!this.stompClient || !this.stompClient.connected) return;

      const message = {
        message: this.newMessage,
        type: 'TALK',
      };

      this.stompClient.send(
        `/publish/${this.roomId}`,
        {}, // 헤더 없음
        JSON.stringify(message)
      );

          this.newMessage = '';
        },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatBox = this.$el.querySelector('.chat-box');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      });
    },
    async disconnectWebSocket() {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.disconnect();
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