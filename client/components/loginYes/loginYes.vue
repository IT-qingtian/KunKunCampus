<template>
  <view class="loginYes">
    <!--头-->
    <view class="top_">
      <div class="box">
        <div class="top">
          <img class="head" src="@/static/my/head.jpg"></img>
          <text class="name">{{ userInfo.name }}</text>
        </div>
        <div class="bottom"></div>
      </div>
    </view>

    <!--尾-->
    <view class="bottom_">
      <view class="container">
        <div class="item">
          <div class="left">地址管理</div>
          <div class="rigth"></div>
        </div>
        <div class="item">
          <div class="left">绑定手机</div>
          <div class="rigth"></div>
        </div>
        <div class="item">
          <div class="left">我的投诉</div>
          <div class="rigth"></div>
        </div>
        <div class="item">
          <div class="left">客服交流</div>
          <div class="rigth">028-13241</div>
        </div>
        <div class="item" @click="exit_login">
          <div class="left">退出登陆</div>
          <div class="rigth"></div>
        </div>
      </view>
    </view>
  </view>
</template>

<script>

import {mapState, mapMutations} from 'vuex'

export default {
  data() {
    return {}
  },
  computed: {
    ...mapState('store_user', ['userInfo'])
  },
  methods: {
    ...mapMutations('store_user', ['updateUserInfo', 'updateToken']),
    exit_login() {
      this.updateUserInfo({})
      this.updateToken('')
    },
  }
}
</script>

<style lang="scss">
.loginYes {
  background: #1FA2FF;
  background: -webkit-linear-gradient(to right, #A6FFCB, #12D8FA, #1FA2FF); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #A6FFCB, #12D8FA, #1FA2FF); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  .top_ {
    padding-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 325rpx;

    .box {
      border-radius: 5px;
      position: relative;
      background-color: #fff;
      height: 85%;
      width: 95%;

      .top {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        transform: translateY(-35%);

        .head {
          margin-bottom: 5px;
          border-radius: 50%;
          width: 150rpx;
          height: 150rpx;
          box-shadow: 5px 5px 20px 0px #423f3f;
        }

        .name {

        }
      }

      .bottom {
        background-color: red;
      }
    }
  }

  .bottom_ {
    padding-top: 15px;
    background-color: white;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    overflow: hidden;

    .item {
      padding: 10px 0;
      margin: 0 15px;
      border-top: 0.1px solid #8f8f94;
      display: flex;

      .left {
        flex: 1;
        //flex-direction: row;
        font-weight: bold;
      }

      .rigth {
        text-align: right;
        flex: 1;
      }
    }
  }
}


</style>
