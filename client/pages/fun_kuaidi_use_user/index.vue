<template>
  <view>
    <!--如果有数据那就-->
    <use_user_yes v-if='userInfo.address.length'></use_user_yes>
    <use_user_no v-else></use_user_no>
    <!--添加地址-->
    <view class="address" @click="add_address">
      添加地址
    </view>
  </view>
</template>

<script>
import {mapState, mapMutations} from "vuex"

export default {
  async onPullDownRefresh() {

    await this.get_user_address()
    // console.log(r)
    // // 停止下拉刷新
    uni.stopPullDownRefresh()
    // console.log(code, msg, data)
    //
    // // 弹出提示
    // uni.$showMsg(msg)
    // // 访问失败则清空token
    // if (!code) {
    //   // this.updateToken('')
    // } else {
    //   // 更新地址
    //   this.userInfo.address = data.address
    // }

  },
  computed: {
    //  取出
    ...mapState('store_user', ['userInfo', 'token']),
  },
  data() {
    return {}
  },
  methods: {
    ...mapMutations('store_user', ['updateToken', 'get_user_address']),
    add_address() {
      uni.navigateTo({
        url: "/pages/fun_kuaidi_add_address/index"
      })
    }
  },
  mounted() {
    console.log('ok')
  }
}
</script>

<style scoped lang="scss">

.address {
  background-color: dodgerblue;
  position: fixed;
  bottom: 0;
  color: white;
  //height: 100rpx;
  width: 85%;
  //  居中
  left: 50%;
  transform: translateX(-50%);
  box-sizing: border-box;
  margin: 5px;
  text-align: center;
  padding: 10px;
  border-radius: 30px;
}

</style>
