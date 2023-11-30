<template>
  <div class="container_login">
    <el-button type="primary" round size="large" @click="login()">登录运送端</el-button>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, toRefs, computed, toRef, onMounted, nextTick, defineProps} from 'vue'
import {run_login} from '@/server'
import {user} from '@/store'
import {onLoad} from "@dcloudio/uni-app";

const store_user = user()
const props = defineProps({
  msg: String
})
let loginCode = ''


async function login(url: string = '/pages/run/index') {

  const {code, msg, data} = await run_login(loginCode)
  console.log({code, msg, data})
  if (code) {
    // 更新身份码
    store_user.setAuthorization_run(data.token)
    console.log('获取服务器返回的login对象', data)
    uni.navigateTo({url})
  } else {
    alert(msg)
  }
}

onLoad((url_params: any) => {
  console.log('url_params', url_params)
  // 如果有提示语就展示提示语
  props.msg && uni.showToast({
    title: props.msg,
    icon: 'none'
  })

  loginCode = url_params.code
  if (!loginCode) return console.log('不存在code！')

//   如果有携带回调地址 那就自动登录
  if (url_params.callbackUrl) {
    login(url_params.callbackUrl)
  }
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
