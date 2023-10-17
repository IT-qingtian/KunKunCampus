<template>
  <div class="container_order_my">
    <div class="userinfo">
      <div class="bg"></div>
      <div class="top">
        <div class="left">
          <image></image>
        </div>
        <div class="right">
          <div class="info">
            <div class="name">{{ store_user.userInfo.name }}</div>
            <div class="level">{{ store_user.userInfo.is_root ? '老板' : '打工仔' }}</div>
          </div>
          <div class="changeInfo" @click="changeUserInfo">
            <i class="iconfont icon-weibiaoti2010104"></i>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="data">
          <div class="item">
            <div class="describe">今日销售量</div>
            <div class="number">{{ store_user.userInfo.sales_volume_day }}</div>
          </div>
          <div class="item">
            <div class="describe">今日营收</div>
            <div class="number">{{ store_user.userInfo.amount_day }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="function">
      <div class="item" v-for="(item,index) in function_data.data" :key="index" @click="gotoPage(item)">
        <div class="icon"><i class="iconfont" :class="item.icon"></i></div>
        <div class="text">{{ item.text }}</div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: 'page_my'
})
</script>


<script lang="ts" setup>
import {user} from '@/store'
//  引入发包
import {onMounted, reactive, ref, watch} from 'vue'
import {ElLoading} from 'element-plus'
import {onLoad} from "@dcloudio/uni-app";

const store_user = user()

type item_data = {
  icon: string,
  text: string,
  url?: string
}
const function_data = {
  data: [{
    icon: "icon-dianpuguanli",
    text: "店铺管理",
    url: "/pages/boss/shop_manage"
  }, {
    icon: "icon-tongjijisuan",
    text: "收益统计",
    url: "/pages/boss/income"
  }, {
    icon: "icon-caifu",
    text: "我的余额",
    url: "/pages/boss/balance"
  }, {
    icon: "icon-lishidingdan",
    text: "历史订单"
  }, {
    icon: "icon-31daipingjia",
    text: "客人评论"
  }
    /*, {
      icon: "icon-qiyeguanli_yuangongguanli",
      text: "联系管理"
    }*/
  ]
}

const page_data = reactive({
  userInfo: {}
})

function gotoPage(item: item_data) {
// 根据item.url去跳转页面
  uni.navigateTo({
    url: item.url!,
    fail: () => {
      uni.showToast({
        title: '功能开发中',
        icon: "error"
      })
    }
  })
}

function changeUserInfo() {
  uni.showToast({
    title: "对不起，程序员太懒了，这个功能没写，实在有需要请联系一下管理员吧",
    icon: 'error',
    duration: 3000
  })
}

onLoad(async () => {
  // 获取信息
  // const r_userInfo = await boss_get_info()
  // const {code, data, msg} = r_userInfo
  // if (!code) return console.log('请求失败，', msg)

  // page_data.userInfo = data
  // console.log(data, '请求成功。')
})

onMounted(() => {
  console.log('获取自身数据')
})
</script>


<style lang="scss" scoped>
//@import url('//at.alicdn.com/t/c/font_4142601_uo9i0ripha.css');

@keyframes rotate {
  0% {
    transform: translate(0, 0) rotate(0);
  }
  25% {
    transform: translate(-10%, 0) rotate(180deg);
  }
  75% {
    transform: translate(10%, 0) rotate(270deg);
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
  }
}

.container_order_my {
  background-color: white;
  //font-size: 50rpx;
  .bg {
    position: relative;
  }

  .bg::before, .bg::after {
    content: "";
    display: block;
    position: absolute;
    //z-index: -1;
    border-radius: 50%;
    height: 200vw;
    width: 200vw;
    top: -60%;
    left: -40%;
    //background-color: rgba(45, 85, 117, 0.3);
    background-color: rgba(76, 149, 254, 1);
    //background: linear-gradient(125deg, rgb(80, 156, 253), rgba(53, 117, 197, 0.93));
    //transform: translate(-50%, -70%) rotate(0);
    animation: rotate 5s linear infinite;
  }

  .bg::after {
    background-color: rgba(59, 111, 255, 0.5);
    animation: rotate 10s linear infinite;
  }

  .userinfo {
    overflow: hidden;
    background-color: deepskyblue;
    display: flex;
    flex-direction: column;
    height: 500rpx;
    //background: linear-gradient(125deg, rgb(80, 156, 253), rgba(53, 117, 197, 0.93));


    .top {
      //background-color: black;
      flex: 6;
      display: flex;
      //  头像
      .left {

        flex: 3;

        image {
          //background-color: blue;
          width: 170rpx;
          height: 170rpx;
          border: 3px solid white;
          border-radius: 50%;
          //  居中
          position: relative;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }

      .right {
        position: relative;
        flex: 7;
        color: black;
        font-size: 60rpx;
        //  垂直居中
        display: flex;
        flex-direction: column;
        justify-content: center;

        .info {
          .name {
            font-weight: bold;
          }

          .level {
            font-size: 35rpx;
          }
        }

        .changeInfo {
          position: absolute;
          //  居中
          top: 50%;
          right: 15px;
          transform: translateY(-50%);

          i {
            font-size: 100rpx;
          }
        }
      }
    }

    .bottom {
      flex: 4;
      //background-color: red;

      .data {
        //  居中
        position: relative;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 95%;
        //background-color: deepskyblue;
        border-radius: 10px 10px 0 0;
        display: flex;
        justify-content: space-around;
        text-align: center;
      }
    }
  }

  .function {
    display: flex;
    flex-wrap: wrap;
    //justify-content: space-between;
    margin: 5px;
    padding: 15px;
    text-align: center;

    .item {
      margin: 5px;
      width: 30%;
      padding: 10px;
      box-sizing: border-box;
      //  阴影盒子
      box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.4);

      .icon {
        i {
          //color: rgb(73, 76, 80);
          color: black;
          font-size: 80rpx;
          //font-weight: bold;
        }
      }

      .text {
        font-size: 40rpx;
      }
    }
  }
}
</style>