<template>
    <v-container fluid class="login-container d-flex align-center justify-center fill-height">
      <v-card class="pa-6 login-card" max-width="400" elevation="10">
        <v-card-title class="text-h5 font-weight-bold justify-center white--text">
          SNS 로그인
        </v-card-title>
  
        <v-card-text>
          <div class="text-center grey--text text--lighten-1 mb-4">
            옵빠 bepl에 온걸 환영해!
          </div>
  
          <v-btn
            block
            color="white"
            class="mb-4 text-none d-flex align-center justify-start google-btn"
            @click="googleLogin"
          >
            <v-img
              src="@/assets/google_login.png"
              alt="Google Logo"
              height="24"
              width="24"
              class="mr-3"
            />
            <span class="black--text font-weight-medium">Google 계정으로 로그인</span>
          </v-btn>
  
          <v-btn
            block
            color="#03c75a"
            class="text-none d-flex align-center justify-start"
            @click="naverLogin"
          >
            <v-img
              src="@/assets/btnG_완성형.png"
              alt="Naver Logo"
              height="24"
              width="24"
              class="mr-3"
            />
            <span class="white--text font-weight-medium">Naver 계정으로 로그인</span>
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
</template>
<script>
import axios from 'axios';

export default{
    data(){
        return{
            googleUrl: "https://accounts.google.com/o/oauth2/v2/auth",
            googleClientId: "",
            googleRedirectUrl: "http://localhost:3000/member/google/redirect",
            googleScope: "openid email profile https://www.googleapis.com/auth/user.birthday.read https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.phonenumbers.read",

            naverUrl: "https://nid.naver.com/oauth2.0/authorize",
            naverClientId: "",
            naverRedirectUrl: "http://localhost:3000/member/naver/redirect",
            naverScope: "id email gender birthyear birthday age mobile name"
        }
    },
    methods:{
        async memberLogin(){
            const loginData = {
                email: this.email,
                password: this.password
            }
            const response = await axios.post("http://localhost:8080/member/doLogin", loginData);
            const token = response.data.token;
            const refreshToken = response.data.refreshToken
            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            window.location.href = "/";
        },
        googleLogin(){
            const auth_uri = `${this.googleUrl}?client_id=${this.googleClientId}&redirect_uri=${this.googleRedirectUrl}&response_type=code&scope=${this.googleScope}`;
            window.location.href = auth_uri;
        },
        naverLogin(){
            const auth_uri = `${this.naverUrl}?client_id=${this.naverClientId}&redirect_uri=${this.naverRedirectUrl}&response_type=code&scope=${this.naverScope}`;
            window.location.href = auth_uri;
        },

        // googleServerLogin(){
        //     window.location.href = "http://localhost:8080/oauth2/authorization/google";
        // }
    }
}
</script>