<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "balance"
})
</script>

<template>
  <view class="box">
    <view class="main">
      <view class="n">
        <view class="title">可用余额（元）</view>
        <view class="number">5.14</view>
        <view class="to"><a href="">变更明细></a></view>
      </view>
      <view class="control">
        <el-button>提现</el-button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
body {
  box-sizing: border-box;
  padding: 10px;
  background: linear-gradient(to bottom, rgb(1, 138, 231), rgb(164, 214, 248), #fff); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  .main {
    box-sizing: border-box;
    background-color: #fff;
    padding: 10px;

    .n {
      .title {
        text-align: center;
        color: rgb(140, 140, 140);
        font-size: 20rpx;
      }

      .number {
        text-align: center;
        font-weight: bold;
      }

      .to {
        text-align: center;
        font-size: 20rpx;

        a {
          color: rgb(121, 178, 255);
          text-decoration: none;
        }
      }
    }

    .control {
      margin: 15px 0;
      display: flex;
      justify-content: center;
    }
  }

}
</style>