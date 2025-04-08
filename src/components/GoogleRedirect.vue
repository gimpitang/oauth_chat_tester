<template>
    <div>
        구글 로그인 진행중...
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
            const response = await axios.post("http://localhost:8080/member-service/member/google/doLogin", {code});
            const token = response.data.token;
            const refreshToken = response.data.refreshToken;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            window.location.href = "/";
        }
    }
}
</script>