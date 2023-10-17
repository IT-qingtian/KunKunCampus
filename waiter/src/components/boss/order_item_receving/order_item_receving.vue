<script setup lang="ts">
import {defineProps, onMounted} from 'vue';

// 接收props
const props = defineProps({
  out_trade_no: {
    type: Number,
    required: true
  },
  title: String,
  amount: String,
  data: Object
})

const show_order = () => {
  uni.navigateTo({
    url: `/pages/boss/order?id=${props.out_trade_no}`
  })
}

onMounted(() => {
})
</script>

<template>
  <div class="contianer">
    <!--头信息-->
    <header>
      <span class="title">{{ props.title }}</span>
      <span class="amount">￥{{ props.amount }}</span>
    </header>
    <!--主要信息-->
    <bodyer>
      <div class="main_info">
        <div class="item">
          <div class="key">服务类型：</div>
          <div class="value">{{ props.data.take_goods_mode ? '到店自提' : '送货上门' }}</div>
        </div>
        <div class="item">
          <div class="key">联系方式：</div>
          <div class="value">{{
              props.data.take_goods_mode ? `自提码${props.data.take_goods_code}` : props.data?.address.name + ' ' + props.data?.address.phoneCode
            }}
          </div>
        </div>
        <div class="item" v-if="!props.data.take_goods_mode">
          <div class="key">配送地址：</div>
          <div class="value">{{ props.data?.address.numberPlate }}</div>
        </div>
      </div>
    </bodyer>
    <footer>
      <el-button size="large" type="primary" round @click="show_order">查看订单</el-button>
    </footer>
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

  bodyer {
    .main_info {
      .item {
        display: flex;
        //justify-content: space-between;
        padding: 2px 0;

        .key {
          flex: 1;
        }

        .value {
          flex: 1;
        }
      }
    }
  }
}

</style>