<template>
  <!-- 根据登陆情况选择对应页面 -->
  <view>
    <loginYes v-if="token"></loginYes>
    <loginNo v-else></loginNo>
  </view>
</template>

<script>
// 	引入
import {
  mapState,
  mapMutations
} from "vuex"

export default {
  data() {
    return {}
  },
  created() {
  },
  computed: {
    ...mapState('store_user', ['token']),
  },
  methods: {
    ...mapMutations('store_user', ['updateToken']),
  },
  mounted() {
  }
}
</script>

<style>
</style>
