<template>
    <v-container>
      <v-card>
        <v-card-title>채팅방 참여</v-card-title>
        <v-card-text>
          <v-text-field v-model="roomId" label="참여할 Room ID 입력" />
          <v-btn color="success" @click="joinRoom">참여하기</v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        roomId: '',
      };
    },
    methods: {
      async joinRoom() {
        const memberId = localStorage.getItem('memberId');
        try {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || process.env.VUE_APP_API_BASE_URL}/chat/room/group/${this.roomId}/join`,
            {},
            {
              headers: {
                'X-User-Id': memberId,
              },
            }
          );
          alert('채팅방 참여 성공!');
          this.$router.push(`/chatpage/${this.roomId}`);
        } catch (error) {
          alert('참여 실패: ' + error.response?.data || error.message);
        }
      },
    },
  };
  </script>