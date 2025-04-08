<template>
  <v-app>
    <HeaderComponent/>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    HeaderComponent
  },
  mounted() {
  const code = new URLSearchParams(window.location.search).get('code');
  const currentPath = window.location.pathname;

  if (code && currentPath.includes("/google/redirect")) {
    axios.post('/member-service/member/google/doLogin', { code })
      .then(res => {
        console.log("로그인 성공", res.data);
        localStorage.setItem('token', res.data.token);
        this.$router.push('/');
      })
      .catch(err => {
        console.error("구글 로그인 실패", err);
      });
  }

  if (code && currentPath.includes("/naver/redirect")) {
    axios.post('/member-service/member/naver/doLogin', { code })
      .then(res => {
        console.log("로그인 성공", res.data);
        localStorage.setItem('token', res.data.token);
        this.$router.push('/');
      })
      .catch(err => {
        console.error("네이버 로그인 실패", err);
      });
    }
  }
  
}
</script>

<style>
</style>
