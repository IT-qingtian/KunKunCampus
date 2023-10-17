<template>
  <view class="content">
    <navigator url="/pages/boss/login">
      <el-button>登陆商户端</el-button>
    </navigator>
    <navigator url="/pages/run/login">
      <el-button>登陆骑手</el-button>
    </navigator>
  </view>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const title = ref('Hello')
// 通过url获取参数a
const params = new URLSearchParams(location.search)
const code = params.get('code')
console.log('code:', code)

</script>

<style>
.content {
  display: flex;
}
</style>