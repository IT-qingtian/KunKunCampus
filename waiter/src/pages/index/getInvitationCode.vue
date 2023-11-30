<script setup lang="ts">
import {get_invitation_code} from '@/server'

import {onMounted, ref} from "vue";

let code: string
let invitation_code = ref('')
onMounted(() => {
// 获取url参数
    const url_params = new URLSearchParams(location.search)
    code = url_params.get('code')!
    if (!code) return uni.showToast({title: "无效的操作，请重新从公众号进入本页面！", icon: "error"})
})

const getCode = async () => {
    if (!code) return uni.showToast({title: "无效的操作，请重新从公众号进入本页面！", icon: "error"})
    //     发起请求获取身份码请求
    const {code: r_code, msg, data} = await get_invitation_code(code)

    if (!r_code) return uni.showToast({title: msg, icon: "error"})
    invitation_code.value = data.invitation_code
}

</script>

<template>
    <el-button type="primary" size="large" @click="getCode">获取邀请码</el-button>
    <br>
    <el-text type="primary">* 本页面用于给开发者注册信息店铺、申请骑手信息。</el-text>
    <br>
    <text>{{ invitation_code }}</text>
</template>

<style scoped lang="scss">
body {
    padding: 10px;
    box-sizing: border-box;
}

text {
    //    超出换行
    word-break: break-word;
}
</style>