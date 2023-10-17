<template>
  <view class="content">
    <!-- 头像区 -->
    <view class='header'>
      <image class='headImg' src='../../static/my/head.jpg'></image>
      <text>坤坤校园</text>

    </view>
    <!--  主体区-->
    <!-- <text>没登录</text> -->
    <view class="container">
      <button type="primary" @click='login'>微信一键登陆</button>
      <view class="text">
        <text>申请获得权限，以此登陆小程序使用服务。</text>
        <br>
        <text>一个只为自贡职业技术学院服务的小程序。</text>
      </view>
    </view>
  </view>
</template>

<script>
import {mapMutations, mapState} from 'vuex'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapState('store_user', ['token', 'subscribeMessages_templIDs']),
  },
  methods: {
    ...mapMutations('store_user', ['updateUserInfo', 'updateToken']),
    async login() {
      await this.get_subscribeMessage()

      //  获取到用户信息
      uni.getUserInfo({
        success: (e) => {
          console.log(e.userInfo, '::userinfo')
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
              const {data: {code: resultCode, msg, data}} = resLogin

              console.log('::登陆后返回的数据', data)
              if (resultCode) {
                //  解析出token和 logon信息
                const {token, userInfo} = data
                this.updateToken(token)

                //  更新用户信息
                this.updateUserInfo(userInfo)

                // 更新用户地址
                uni.$showMsg('登陆成功！')
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

    },
    // 获取通知权限
    get_subscribeMessage() {
      return new Promise((resolve, reject) => {
        console.log("::tmplIds", this.subscribeMessages_templIDs)

        uni.requestSubscribeMessage({
          tmplIds: this.subscribeMessages_templIDs,
          success: (res) => {
            console.log('==【订阅消息】授权成功通知：', res)
            resolve(res)
          },
          fail: (e) => {
            console.log('==【订阅消息】授权失败通知', e)
            resolve(e)
          }
        })
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

.header {
  height: 50vh;
  //  居中
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.headImg {
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  overflow: hidden;
}

.container {
  padding: 15px;

  .text {
    color: rgb(144, 164, 174);
    width: 100vw;
    font-size: 25rpx;
    position: absolute;
    bottom: 5px;
  }
}
</style>
