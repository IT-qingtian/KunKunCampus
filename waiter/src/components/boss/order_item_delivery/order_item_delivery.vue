<script setup lang="ts">
import {defineComponent, defineEmits, defineProps} from 'vue';
import {boss_over_order} from '@/server'

// 接收props
const props = defineProps({
  out_trade_no: {
    type: Number,
    required: true
  },
  title: String,
  amount: String
})
const emit = defineEmits(['refreshOrders'])

const reach = async (out_trade_no: number) => {
  const {code, data, msg} = await boss_over_order(out_trade_no)
  if (!code) return uni.showToast({
    title: msg,
    icon: 'none'
  })
  console.log('等待刷新页面')
  emit('refreshOrders')
}

</script>

<template>
  <div class="contianer">
    <!--头信息-->
    <header>
      <span class="title">{{ props.title }}</span>
      <span class="amount">￥{{ props.amount }}</span>
    </header>
    <el-button size="large" type="primary" round @click="reach(props.out_trade_no as number);">派送到达</el-button>
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