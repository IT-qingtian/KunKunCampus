<template>
  <view class="content">
    <navigator :url="'/pages/boss/login?code='+code">
      <el-button>登陆商户端</el-button>
    </navigator>
    <navigator :url="'/pages/run/login?code='+code">
      <el-button>登陆骑手</el-button>
    </navigator>
  </view>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import cfg from '@/configs'

const title = ref('Hello')

// 通过url获取参数a
const params = new URLSearchParams(location.search)
let code = params.get('code')
const state = params.get('state')!

interface obj {
  url?: string
}

let obj: obj = {}

try {
  obj = JSON.parse(state)
} catch (e) {
//     不是一段json字符串
}

console.log(obj)

console.log('code:', code)
// 如果obj里面有 指定获取授权
if (obj.authorize_type) {
  const type = obj.authorize_type
  switch (type) {
    case  cfg.__authorize_type.boss: {
      let url = `/pages/boss/login?code=${code}`
      //   如果需要回调跳转
      obj.callbackUrl && (url += `&callbackUrl=${obj.callbackUrl}`)
      console.log(url)

      //  自动跳转
      uni.navigateTo({
        url
      })
      break
    }
    case  cfg.__authorize_type.run: {
      let url = `/pages/run/login?code=${code}`
      //   如果需要回调跳转
      obj.callbackUrl && (url += `&callbackUrl=${obj.callbackUrl}`)
      //  自动跳转
      uni.navigateTo({
        url
      })
      break
    }
  }
}


</script>

<style>
.content {
  display: flex;
}
</style>