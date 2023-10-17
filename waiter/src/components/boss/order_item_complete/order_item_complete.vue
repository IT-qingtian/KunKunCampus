<script setup lang="ts">
import {defineComponent, defineEmits, defineProps} from 'vue';


// 接收props
const props = defineProps({
  out_trade_no: {
    type: Number,
    required: true
  },
  title: String,
  amount: String
})

const show_order = () => {
  uni.navigateTo({
    url: `/pages/boss/order?id=${props.out_trade_no}`
  })
}

</script>

<template>
  <div class="contianer">
    <!--头信息-->
    <header>
      <span class="title">{{ props.title }}</span>
      <span class="amount">￥{{ props.amount }}</span>
    </header>
    <el-button size="large" type="primary" round @click="show_order">查看订单</el-button>
  </div>
</template>

<style scoped lang="scss">
$c_amount: rgb(254, 91, 8);

.contianer {
  background-color: #fff;
  box-sizing: border-box;
  padding: 5px;
  font-size: 40rpx;
  width: 100%;
  margin: 15px auto;
  //background-color: red;
  header {
    display: flex;
    justify-content: space-between;
    //  加粗
    font-weight: bold;

    .title {
    }

    .amount {
      color: $c_amount;

    }
  }

  .el-button {
    //padding: 15px;
    font-size: 50rpx;
    margin-top: 8px;
    width: 100%;
  }
}

</style>