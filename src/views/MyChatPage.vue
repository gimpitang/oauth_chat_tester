<template>
    <v-container>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="text-center text-h5">내 채팅 목록</v-card-title>
            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th>채팅방 ID</th>
                    <th>스트리머 닉네임</th>
                    <th>액션</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="chat in chatList" :key="chat.roomId">
                    <td>{{ chat.roomId }}</td>
                    <td>{{ chat.nickname }}</td>
                    <td>
                      <v-btn color="primary" @click="enterChatRoom(chat.roomId)">입장</v-btn>
                      <v-btn color="error" @click="leaveChatRoom(chat.roomId)">나가기</v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        chatList: [],
        memberId: null,
      };
    },
    async created() {
      this.memberId = localStorage.getItem("memberId");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || process.env.VUE_APP_API_BASE_URL}/chat/my/rooms`, {
        headers: {
          "X-User-Id": this.memberId
        }
      });
      this.chatList = response.data;
    },
    methods: {
      enterChatRoom(roomId) {
        this.$router.push(`/chatpage/${roomId}`);
      },
      async leaveChatRoom(roomId) {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL || process.env.VUE_APP_API_BASE_URL}/chat/room/${roomId}/leave`, {
          headers: {
            "X-User-Id": this.memberId
          }
        });
        this.chatList = this.chatList.filter(chat => chat.roomId !== roomId);
      }
    }
  };
  </script>