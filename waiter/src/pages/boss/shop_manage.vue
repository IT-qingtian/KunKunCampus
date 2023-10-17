<template>
  <div class="container_shop_manage" ref="ref_container_shop_manage">
    <div class="nav">
      <div class="nav_item" v-for="(item,index) in navData.data" :key="index"
           :class="{select:index === navData.index}"
           @click="select_nav(index)">
        <i class="iconfont" :class="item.icon"></i>
        <span>{{ item.text }}</span>
      </div>
    </div>
    <div class="view">
      <component :is="navData.data[navData.index].component"></component>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: '店铺管理'
})
</script>

<script lang="ts" setup>
import {onMounted, reactive, ref, watch} from "vue";
// DOM元素
const ref_container_shop_manage = ref()

let show_nav = ref(true)

function select_nav(index: number) {
  if (!navData.data[index].component) return uni.showToast({icon: "error", title: "暂未开放"})
  navData.index = index
  navData.children_component_current = navData.data[index].component
  // console.log(navData.children_component)
}

// 开启导航滑动显示
function open_nav_move_show() {
  let startX = 0
  let currentX = 0
  ref_container_shop_manage.value.addEventListener('touchstart', function (e_start: any) {
    startX = e_start.touches[0].pageX
    const move_fun = function (e_move: any) {
      currentX = e_move.touches[0].pageX
      if (currentX - startX > 50) {
        show_nav.value = true
        console.log('nav显示状态：true')
        // 注销移动
        ref_container_shop_manage.value.removeEventListener('touchmove', move_fun)
      } else if (startX - currentX > 50) {
        show_nav.value = false
        console.log('nav显示状态：false')
        // 注销移动
        ref_container_shop_manage.value.removeEventListener('touchmove', move_fun)
      }
    }
    ref_container_shop_manage.value.addEventListener('touchmove', move_fun)
  })
}

// 引入组件
//  商品管理
import commodity_manage from '@/components/boss/shop_manage/commodity_manage'
// 店铺管理
import shop_manage from '@/components/boss/shop_manage/shop_manage'

// 导航数据
const navData = reactive({
  index: 0,
  data: [
    {
      icon: "icon-qiyeguanli_yuangongguanli",
      text: "编辑店铺",
      component: commodity_manage
    }, {
      icon: "icon-qiyeguanli_yuangongguanli",
      text: "店铺设置",
      component: shop_manage
    }
  ],
  children_component_current: commodity_manage
})

onMounted(() => {
  setTimeout(() => {
    show_nav.value = false
  }, 100)
  watch(show_nav, (newVal, oldVal) => {
    if (!ref_container_shop_manage.value) return
    ref_container_shop_manage.value.style.transform = newVal ? 'translateX(0)' : 'translateX(-40vw)'
  }, {
    // deep: true,
    immediate: true
  })
// 当ref_container_shop_manage 右滑动50px时 show_nav = true 左滑动50px时 show_nav = false
  open_nav_move_show()
})


</script>

<style scoped lang="scss">
.container_shop_manage {
  width: 140vw;
  height: 100vh;
  display: flex;
  transition: all 0.5s;

  .nav {
    width: 40vw;
    //background-color: pink;
    display: flex;
    flex-direction: column;

    .nav_item {
      //font-size: 50rpx;
      padding: 5px;

      i {
        font-size: 50rpx;
      }
    }

    .select {
      font-weight: bold;
      color: deepskyblue;
    }
  }

  .view {
    width: 100vw;
    background-color: #f5f5f1;
  }
}
</style>