<template>
    <div class="container_login">
        <el-button type="primary" round size="large" @click="login">登陆商户端</el-button>
    </div>
</template>

<script setup lang="ts">
import {ref, reactive, toRefs, computed, toRef, onMounted, nextTick, defineProps} from 'vue'
import {boss_login} from '@/server'
import {user} from '@/store'

const store_user = user()

const props = defineProps({
    msg: String
})
let loginCode = ''


async function login() {
    const {code, msg, data} = await boss_login(loginCode)

    if (code) {
        // 更新身份码
        console.log(store_user)
        store_user.setAuthorization(data.token)

        // 更新用户信息
        store_user.setUserInfo(data.userInfo)
        console.log('获取服务器返回的login对象', data)
        //   跳转回首页
        uni.navigateTo({url: '/pages/boss/index'})
    } else {
        alert(msg)
    }
}

onMounted(() => {
    // 如果有提示语就展示提示语
    props.msg && uni.showToast({
        title: props.msg,
        icon: 'none'
    })
    // search
    const urlParse = new URLSearchParams('?' + location.href.split('?')[1])
    loginCode = urlParse.get('code') as string
    if (!loginCode) return console.log('不存在code！')
})

</script>
<style lang="scss" scoped>
.container_login {
    width: 100vw;

    .el-button {
        width: 80%;
    }
}
</style>
