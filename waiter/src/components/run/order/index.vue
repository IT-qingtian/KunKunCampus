<script setup lang="ts">
// 导入 server
import {run_get_orders} from '@/server'
import {onMounted, reactive} from "vue";
import card_order_receving from '@/components/run/order/card_order_receving/index.vue'

const data = reactive({
  orders: []
})

onMounted(async () => {
  // 获取最新订单
  const r_orders = await run_get_orders()
  if (!r_orders.code) return uni.showToast({title: r_orders.msg})
  data.orders = r_orders.data
  console.log(data.orders)
})

</script>

<template>
  <div class="order_container">
    <div class="orders">
      <scroll-view scroll-y height class="order_scroll">
        <div class="item_order" v-for="item in data.orders">
          <card_order_receving  v-if="item.type === 3" :data=item></card_order_receving>
        </div>
      </scroll-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.order_container {
  background-color: rgb(244, 244, 242);
  height: 100%;

  .orders {
    .order_scroll {
      height: 90vh
    }
  }
}

</style>