<template>
  <view class="content">
    <!-- 头像区 -->
    <view class='header'>
      <image class='headImg' src='../../static/my/head.jpg'></image>
      <!-- <text>坤坤校园</text> -->
      <p>坤坤校园</p>
      <br>
      <text>一家专门服务校园的小程序</text>
    </view>
    <!--  主体区-->
    <!-- <text>没登录</text> -->
    <view class="container">
      <text>申请获得权限，以此登陆小程序使用服务。</text>
      <button type="primary" @click='login'>微信一键登陆</button>
    </view>
  </view>
</template>

<script>
import {mapMutations, mapState} from 'vuex'

export default {
  data() {
    return {}
  },
  methods: {
    ...mapMutations('store_user', ['updateToken']),
    login() {
      //  获取到用户信息
      uni.getUserInfo({
        success: (e) => {
          console.log(e.userInfo, 'userinfo')
          //  获取code 并且发送给服务器拿到身份openid。
          uni.login({
            success: async (e) => {
              //  通过code给后端换取身份。
              const code = e.code
              const resLogin = await uni.$httpRequest({
                url: "my/login",
                method: "post",
                data: {code}
              })
              //  拿到数据
              const {data: resLoginData} = resLogin
              const {code: resultCode, msg, data} = resLoginData
              if (resultCode) {
                this.updateToken(data.token)
              } else {
                uni.$showMsg(`登陆失败 ${msg}`)
              }
            },
            fail: err => uni.$showMsg(`登陆失败，${err.errMsg}`)
          })
        },
        fail: err => {
          uni.$showMsg(`获取用户信息失败，${err.errMsg}`)
          console.error(err)
        }
      })

    }
  },
  mounted() {

  }
}
</script>

<style lang='scss'>
.content {
  text-align: center;
}

.headImg {
  width: 750 rpx;
  height: 750 rpx;
  border-radius: 50%;
  overflow: hidden;
}

.container {
  padding: 15px;
}
</style>
