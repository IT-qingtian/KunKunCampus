<script setup lang="ts">
// 导入 组件名
import {defineComponent} from "vue";
// 获取props
const props = defineProps({
  data: Object
})
console.log(props.data)
const jum_detail = (out_trade_no: string) => {
//     跳转到详情页
  uni.navigateTo({
    url: '/pages/run/order_detail?out_trade_no=' + out_trade_no
  })
}

</script>

<template>
  <div class="container_card">
    <div class="head">
      <div class="out_trade_no">
        订单号：{{ data.out_trade_no }}
      </div>
      <div class="time">
        5分钟前
      </div>
    </div>
    <!--        分割线-->
    <el-divider class="divider"></el-divider>
    <div class="title">
      订单类型：取货送货
    </div>
    <div class="content">
      <div class="info">
        <div class="start_position">
          起始：{{ data.data.shop_title }}
        </div>
        <div class="end_position">
          送至：宿舍号 - {{ data.data.address.numberPlate }}
        </div>
        <div class="notes" v-if="data.data.notes">
          备注：{{ data.data.notes }}
        </div>
      </div>
      <div class="control">
        <div class="price">￥{{ data.data.delivery_fee }}</div>
        <el-button size="large" type="warning" @click="jum_detail(data.out_trade_no )">查看</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container_card {
  margin: 8px;
  padding: 5px;
  background-color: rgb(254, 255, 255);

  .head {
    display: flex;
    justify-content: space-between;
    font-size: 25rpx;
    color: #999999;
  }

  .divider {
    margin: 8px 0;
  }

  .title {
    font-size: 35rpx;
    font-weight: bold;
  }

  .content {
    font-size: 30rpx;
    display: flex;
    justify-content: space-between;
    // .info所有子节点
    .info {
      * {
        margin: 5px 0;
      }

      .notes {
        //    超出显示省略号
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 400rpx;
        font-size: 24rpx;
      }
    }


    .control {
      font-size: 35rpx;
      text-align: center;
      color: rgb(254, 164, 9);
    }
  }
}

</style>