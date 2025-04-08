import { createRouter, createWebHistory } from "vue-router"
import MemberCreate from "@/views/MemberCreate.vue"
import LoginPage from "@/views/LoginPage.vue"
import MemberList from "@/views/MemberList.vue"
import SimpleWebsocket from "@/views/SimpleWebsocket.vue"
import StompChatPage from "@/views/StompChatPage.vue"
import GroupChattingList from "@/views/GroupChattingList.vue"
import MyChatPage from "@/views/MyChatPage.vue"
import GoogleRedirect from "@/components/GoogleRedirect.vue"
import NaverRedirect from "@/components/NaverRedirect.vue"
import ChatRoomCreatePage from "@/views/ChatRoomCreatePage.vue"
import ChatRoomJoinPage from "@/views/ChatRoomJoinPage.vue"

const routes = [
    {
        path:'/member/create',
        name: 'MemberCreate',
        component: MemberCreate
    },
    {
        path:'/login',
        name: 'LoginPage',
        component: LoginPage
    },
    {
        path:'/member/list',
        name: 'MemberList',
        component: MemberList
    },
    {
        path:'/simple/chat',
        name: 'SimpleWebsocket',
        component: SimpleWebsocket
    },
    {
        path:'/chatpage/:roomId',
        name: 'StompChatPage',
        component: StompChatPage
    },
    {
        path:'/groupchatting/list',
        name: 'GroupChattingList',
        component: GroupChattingList
    },
    {
        path:'/my/chat/page',
        name: 'MyChatPage',
        component: MyChatPage
    },
    {
        path: "/member/google/redirect",
        component: GoogleRedirect
    },
    {
        path: "/member/naver/redirect",
        component: NaverRedirect
    },
    {
        path: '/chat/create',
        name: 'ChatRoomCreate',
        component: ChatRoomCreatePage
      },
      {
        path: '/chat/join',
        name: 'ChatRoomJoin',
        component: ChatRoomJoinPage
      }

]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;