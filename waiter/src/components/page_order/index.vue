<template>
  <div class="container_page_order" ref="ref_view">
    <!--选择-->
    <div class="tab" ref="ref_tab">
      <tab :tab_data="tabData" :default_index="tabIndex" @changeTab="changeTab"></tab>
    </div>
    <!--订单-->
    <div class="orders" ref="ref_orders">
      <scroll-view scroll-y>
        <component :is="tabData[tabIndex].component"
                   v-for="(item,index) in tabData[tabIndex].data"
                   :key="index"
                   :title="item.description"
                   :amount="formatMoney(item.total)"
                   :out_trade_no="item.out_trade_no"
                   :data="item.data"
                   @refreshOrders='refreshOrders'
        ></component>
      </scroll-view>
      <div class="control">
        <el-button round type="primary" @click="refreshOrders">刷新</el-button>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">


//  引入ax
import {boss_pull_order} from '@/server'
import {nextTick, onMounted, reactive, ref} from 'vue'
import {formatMoney} from '@/function'

// 引入组件
import receving from '@/components/boss/order_item_receving/order_item_receving.vue'
import processing from '@/components/boss/order_item_processing/order_item_processing.vue'
import delivery from '@/components/boss/order_item_delivery/order_item_delivery.vue'
import complete from '@/components/boss/order_item_complete/order_item_complete.vue'
import {onShow} from "@dcloudio/uni-app";


// 组件订单
const component_order_template = {
  base: 'order_item',
  // 未接单
  receving,
  // 处理中
  processing,
  // 派送中
  delivery,
  // 完成
  complete,
}
// 导航数据
const tabData = reactive([
  {
    title: '今日订单',
    component: component_order_template.receving,
    fun: () => {
      // 返回原数据
      return orders
    },
    data: []
  },
  {
    title: '未接单',
    component: component_order_template.receving,
    fun: () => {
      if (!orders_copy.length) return []

      // 从源数据里过滤出来
      const f = orders_copy.filter((item: any, index: number) => (item.status === 1 && item.order_over === 0))
      // 剩下的数据
      const s = orders_copy.filter(item => !f.includes(item))
      orders_copy.length && orders_copy.splice(0, orders_copy.length) && orders_copy.push(...s as [])
      return f
    },
    data: []
  },
  {
    title: '处理中',
    component: component_order_template.receving,
    fun: () => {
      if (!orders_copy.length) return []
      // 从源数据里过滤出新的
      console.log('-====')
      console.log(orders_copy)
      console.log('-====')
      const f = orders_copy.filter((item: any, index: number) => (item.status === 1 && item.order_over === 1))
      // 源数据里过滤走满足条件的
      const s = orders_copy.filter(item => !f.includes(item))
      // 清空源数据 并留下不满足条件的
      orders_copy.length && orders_copy.splice(0, orders_copy.length) && orders_copy.push(...s)
      return f
    },
    data: []
  },
  {
    title: '配送中',
    component: component_order_template.receving,
    fun: () => {
      if (!orders_copy.length) return []
      // 从源数据里过滤出新的
      const f = orders_copy.filter((item: any, index: number) => (item.status === 1 && item.order_over === 3 && item.receving_order_info.is_merchant_dispatch))
      // 源数据里过滤走满足条件的
      const s = orders_copy.filter(item => !f.includes(item))
      // 清空源数据 并留下不满足条件的
      orders_copy.length && orders_copy.splice(0, orders_copy.length) && orders_copy.push(...s)
      return f
    },
    data: []
  },
  {
    title: '已完成',
    component: component_order_template.receving,
    fun: () => {
      if (!orders_copy.length) return []
      // 从源数据里过滤出新的
      const f = orders_copy.filter((item: any, index: number) => (item.status === 1 && item.order_over === 4))
      // 源数据里过滤走满足条件的
      const s = orders_copy.filter(item => !f.includes(item))
      // 清空源数据 并留下不满足条件的
      orders_copy.length && orders_copy.splice(0, orders_copy.length) && orders_copy.push(...s)
      return f
    },
    data: []
  },
])
// 当前导航项
let tabIndex = ref(1)
// 导航切换
const changeTab = (index: number) => {
  tabIndex.value = index
}


// 订单原数据
const orders: [] = reactive([])
// 拟
const orders_copy: [] = reactive([])

// 刷新订单数据
const refreshOrders = async () => {
  // 清空原来数组
  orders.length && orders.splice(0, orders.length)
  orders_copy.length && orders_copy.splice(0, orders_copy.length)

  // 清空每个分类
  tabData.map((item: any) => item.data = [])

  // 拉取订单数据
  const {code, data, msg} = await boss_pull_order(0, true)


  if (!code) return uni.showToast({title: msg, icon: 'error'})

  // 添加新数据
  orders.push(...data.reverse() as [])

  // 拷贝数据
  orders_copy.push(...orders)
  console.log('订单数据：', orders, orders_copy)

  // 数据分类

  //  分类
  tabData.map((item: any) => {
    // 全部执行fun方法
    item.data = item.fun && item.fun()
  })
}

// 元素
const ref_tab = ref()
const ref_orders = ref()
const ref_view = ref()

onMounted(() => {
  nextTick(() => {
    ref_orders.value.children[0].style.height = `${ref_view.value.clientHeight - ref_tab.value.clientHeight}px`
    console.log('---------')
    console.log(ref_view.value.clientHeight, ref_tab.value.clientHeight)
    console.log(ref_orders.value.children[0])
    console.log(ref_orders.value.children[0].style.height)
    console.log('---------')
  })
  // 刷新数据
  refreshOrders()
})

let valve_refresh = true
onShow(() => {
  if (valve_refresh) return valve_refresh = !valve_refresh
  refreshOrders()
})

</script>
<style scoped lang="scss">
.container_page_order {
  height: 100%;
  $line_height: 2px;

  .line {
    position: relative;
    background-color: rgb(228, 231, 237);
    height: $line_height;

    .move {
      transition: all 0.5s;
      position: absolute;
      height: 100%;
      background-color: deepskyblue;
    }
  }

  .tabs {
    display: flex;
    white-space: nowrap;

    .tab_item {
      margin: 0 20rpx;
    }

    .tab_item:first-child {
      margin-left: 0;
    }

    .tab_item:last-child {
      margin-right: 0;
    }
  }

  .orders {
    position: relative;
    //控制器
    .control {
      z-index: 9;
      position: absolute;
      right: 0;
      bottom: 15px;
    }
  }
}
</style>