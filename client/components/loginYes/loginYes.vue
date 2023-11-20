<template>
  <div class="view">
    <view class="loginYes">
      <!--    用户信息-->
      <div class="card user_info">
        <!--        <image class="head_img" mode="widthFix" src="@/static/my/head.jpg"></image>-->
        <image class="head_img" mode="widthFix" src="@/static/public/imgs/headImg.png"></image>
        <text class="name">{{ userInfo.name }} ，{{ time_state }}！</text>
      </div>
      <!--    快捷功能-->
      <div class="card shortcut_function">
        <view class="container_">
          <div class="title">快捷功能</div>


          <div class="item" @click="fun_address_manager">
            <div class="left">
              <i class="iconfont icon-dizhiguanli"></i>
              地址管理
            </div>
            <div class="rigth">></div>
          </div>
          <!--          <div class="item">-->
          <!--            <div class="left">绑定手机</div>-->
          <!--            <div class="rigth">></div>-->
          <!--          </div>-->
          <!--          <div class="item">-->
          <!--            <div class="left">我的投诉</div>-->
          <!--            <div class="rigth">></div>-->
          <!--          </div>-->

          <button class="item default" open-type="contact">
            <i class="iconfont icon-rengongkefu"></i>
            联系客服
          </button>

          <!--          <div class="item">-->
          <!--            <div class="left">-->
          <!--              <i class="iconfont icon-guanyu" @click="fun_about"></i>-->
          <!--              关于-->
          <!--            </div>-->
          <!--            <div class="right">></div>-->
          <!--          </div>-->
          <div class="item" @click="exit_login">
            <div class="left">
              <i class="iconfont icon-tuichu"></i>
              退出登陆
            </div>
            <div class="rigth">></div>
          </div>
        </view>
      </div>
    </view>
  </div>
</template>

<script>

import {mapState, mapMutations} from 'vuex'

export default {
  data() {
    return {
      time_state: '欢迎您！'
    }
  },
  computed: {
    ...mapState('store_user', ['userInfo'])
  },
  methods: {
    ...mapMutations('store_user', ['updateUserInfo', 'updateToken']),
    // 地址管理
    fun_address_manager() {
      uni.navigateTo({
        url: '/pages/fun_kuaidi_use_user/index'
      })
    },
    fun_about() {
      console.log('关于')
    },
    exit_login() {
      this.updateUserInfo({})
      this.updateToken('')
    },
  },
  mounted() {
    const now = new Date()
    const hour = now.getHours()
    if (hour <= 10 && hour >= 7) {
      this.time_state = '早上好!'
    } else if (hour <= 12 && hour > 10) {
      this.time_state = '上午好!'
    } else if (hour <= 18 && hour > 12) {
      this.time_state = '下午好!'
    } else {
      this.time_state = '晚上好!'
    }
  }
}
</script>

<style lang="scss" scoped>
.default {
  background-color: #fff;
  padding: 0;
  line-height: normal;
}

::after {
  border: none;
}

.view {
  height: 100vh;
  background: linear-gradient(to bottom, rgb(244, 133, 114), rgb(244, 245, 245) 50%, rgb(244, 245, 245) 100%);
  box-sizing: border-box;
  padding: 15px;
}

.loginYes {
  .card {
    background-color: #fff;
    box-sizing: border-box;
    padding: 15px;
    border-radius: 3px;
    margin: 15px 0;
  }

  .user_info {
    margin-top: 10vh;
    display: flex;
    align-items: center;

    .head_img {
      flex: 2;
      border-radius: 50%;
    }

    .name {
      flex: 8;
      font-size: 40rpx;
      box-sizing: border-box;
      padding-left: 30rpx;
      //  超出换行
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .shortcut_function {
    .container_ {
      .title {
        font-size: 32rpx;
        font-weight: bold;
      }

      .item {
        font-size: 30rpx;

        padding: 10px 0;
        border-top: 1px solid rgb(239, 241, 240);
        display: flex;

        .left {
          .iconfont {
            margin-right: 3px;
          }

          flex: 1;
          display: flex;
          align-items: center;
          //flex-direction: row;
          //font-weight: bold;
        }

        .rigth {
          text-align: right;
          flex: 1;
        }
      }
    }
  }
}


</style>
