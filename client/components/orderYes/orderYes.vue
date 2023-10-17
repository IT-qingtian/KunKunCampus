<template>
  <scroll-view scroll-y class="orders">
    <div v-for="(item,index) in orderList" :key="index">
      <!--根据item.type来选择卡片-->
      <order_card_kd @refresh_list='$emit("refresh_list")' v-if="item.type==1" :data="item"></order_card_kd>
      <order_card_shop @refresh_list='$emit("refresh_list")' v-else-if="item.type==3"
                       :data="item"></order_card_shop>
    </div>
  </scroll-view>
</template>

<script>
export default {
  props: {
    orderList: {},
  },
  data() {
    return {}
  },
  methods: {},
  mounted() {

  }
}
</script>

<style lang="scss">
.orders {
  flex: 1;
  height: 100%;
}
</style>
