<template>
    <v-container>
      <v-card>
        <v-card-title>채팅방 생성</v-card-title>
        <v-card-text>
          <v-text-field v-model="streamingId" label="Streaming ID 입력" />
          <v-btn color="primary" @click="createChatRoom">채팅방 생성</v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        streamingId: '',
      };
    },
    methods: {
        async joinChatRoom(roomId){
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/chat/room/${roomId}/join`);
            this.$router.push(`/chatpage/${roomId}`);
        },
      async createChatRoom() {
  
        try {
          await axios.post(
            `${process.env.VUE_APP_API_BASE_URL}/chat/room/create?roomName=${this.streamingId}`,
            { streamingId: this.streamingId }
          );
          alert('채팅방 생성 성공!');
        } catch (error) {
          alert('채팅방 생성 실패: ' + error.response?.data || error.message);
        }
      },
    },
  };
  </script>