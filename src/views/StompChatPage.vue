<!-- <template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title class="text-center text-h5">
                        채팅
                    </v-card-title>
                    <v-card-text>
                        <div class="chat-box">
                            <div 
                             v-for="(msg, index) in messages"
                             :key="index"
                             :class="['chat-message', msg.memberId === memberId ? 'sent' : 'received' ]"
                            >
                                <strong>{{ msg.memberNickname }}: </strong> {{ msg.message }}
                            </div>
                        </div>
                        <v-text-field
                            v-model="newMessage"
                            label="메시지 입력"
                            @keyup.enter="sendMessage"
                            :disabled="!isLoggedIn"
                        />
                        <v-btn color="primary" block @click="sendMessage" :disabled ="!isLoggedIn">전송</v-btn>
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

export default{
    data(){
        return {
            messages: [],
            newMessage: '',
            stompClient: null,
            token: '',
            memberId: null,
            nickname: '',
            roomId: null,
            isLoggedIn: false,
        }
    },
    async created(){
        this.token = localStorage.getItem('token');
        this.isLoggedIn = !!this.token;

        this.roomId = this.$route.params.roomId;
        // 메시지 조회
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/streaming-service/chat/history/${this.roomId}`);
        this.messages = response.data;
        
        this.connectWebsocket();
    },
    // 사용자가 현재 라우트에서 다른 라우트로 이동하려고 할때 호출되는 훅함수
    beforeRouteLeave(to, from, next) {
        this.disconnectWebSocket();
        next();
    },
    // 화면을 완전히 꺼버렸을때
    beforeUnmount() {
        this.disconnectWebSocket();
    },
    methods: {
        connectWebsocket(){
            if(this.stompClient && this.stompClient.connected) return;
            // sockjs는 websocket을 내장한 향상된 js 라이브러리. http엔드포인트 사용.
            const sockJs = new SockJS(`${process.env.VUE_APP_API_BASE_URL}/streaming-service/connect`)
            this.stompClient = Stomp.over(sockJs);
            // this.token = localStorage.getItem("token"); 위에서 갖고와서 주석처리함.

            const headers = {};
            if (this.token) {
                headers.Authorization = `Bearer ${this.token}`;
            }
            
            this.stompClient.connect(headers,()=>{
                    this.stompClient.subscribe(`/topic/${this.roomId}`, (message) => {
                        const parseMessage = JSON.parse(message.body);
                        this.messages.push(parseMessage);
                        this.scrollToBottom();
                    });
                });
        },
        sendMessage() {
            if (!this.newMessage.trim()) return;

            const message = {
                message: this.newMessage,
                type: 'TALK',
            };

            this.stompClient.send(`/publish/${this.roomId}`, {}, JSON.stringify(message));
            this.newMessage = '';
            }
            ,
        scrollToBottom(){
            this.$nextTick(()=>{
                const chatBox = this.$el.querySelector(".chat-box");
                chatBox.scrollTop = chatBox.scrollHeight;
            })
        },
        async disconnectWebSocket(){
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.disconnect();
            }
        },
        
    },
}
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
</style> -->