<template>
    <div class="loading-container">
        <img src="@/assets/홈페이지 로그인 중 화면.gif" alt="로딩 중..." class="loading-gif" />
        <p>구글 로그인 진행중...</p>
    </div>
</template>

<script>
import axios from 'axios';

export default{
    created(){
        const code = new URL(window.location.href).searchParams.get("code");
        console.log("Google OAuth code:", code); // 코드 잘 나오는지 찍는 코드
        this.sendCodeToServer(code);
    },
    methods:{
        async sendCodeToServer(code){
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/google/doLogin`, {code});
            const token = response.data.token;
            const refreshToken = response.data.refreshToken;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            console.log("리프레시토큰 나오는지 확인 "+refreshToken)
            setTimeout(() => {
            window.location.href = "/";
            }, 1000);
        }
    }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.loading-gif {
  width: 1200px;
  height: 1000px;
  margin-bottom: 1rem;
}
</style>