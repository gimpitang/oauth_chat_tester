<template>
    <div>
        네이버버 로그인 진행중...
    </div>
</template>

<script>
import axios from 'axios';

export default{
    created(){
        const code = new URL(window.location.href).searchParams.get("code");
        console.log(code);
        this.sendCodeToServer(code);
    },
    methods:{
        async sendCodeToServer(code){
            const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/naver/doLogin`, {code});
            const token = response.data.token;
            const refreshToken = response.data.refreshtoken;
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            window.location.href = "/";
        }
    }
}
</script>