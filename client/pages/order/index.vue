<template>
  <view class="container">
    <div class="tab">
      <scroll-view scroll-x="true">
        <text class="tab_item" :class="select === 0? 'select':''" @click.stop="select_order(0)">全部</text>
        <text class="tab_item" :class="select === 1? 'select':''" @click.stop="select_order(1)">待支付</text>
        <text class="tab_item" :class="select === 2? 'select':''" @click.stop="select_order(2)">待接单</text>
        <text class="tab_item" :class="select === 3? 'select':''" @click.stop="select_order(3)">处理中</text>
        <text class="tab_item" :class="select === 4? 'select':''" @click.stop="select_order(4)">已完成</text>
        <text class="tab_item" :class="select === 5? 'select':''" @click.stop="select_order(5)">待评价</text>
      </scroll-view>
    </div>
    <div class="content">
      <orderYes class="content_children" :orderList="orderList" @refresh_list='getOrderData'
                v-if="orderList.length"></orderYes>
      <orderNo class="content_children" v-else></orderNo>
    </div>
  </view>
</template>

<script>
import {mapState, mapMutations} from "vuex"

export default {
  data() {
    return {
      select: 0,
      orderList: [],
      // orderList: [
      //   {
      //     //  商店名
      //     shop_title: "擎天科技",
      //     //  预图片
      //     img_address: "",
      //     //  物品名
      //     goods_title: '代取快递',
      //     //  物品描述
      //     goods_describe: '代取快递，送至6412代取快递，送至6412代取快递，送至6412代取快递，送至6412代取快递，送至6412代取快递，送至6412',
      //   },
      //   {
      //     //  商店名
      //     shop_title: "小马只运科技",
      //     //  预图片
      //     img_address: "",
      //     //  物品名
      //     goods_title: '送餐',
      //     //  物品描述
      //     goods_describe: '代取快递，阿斯利康的就',
      //   },
      //   {
      //     //  商店名
      //     shop_title: "小马只运科技",
      //     //  预图片
      //     img_address: "",
      //     //  物品名
      //     goods_title: '送餐',
      //     //  物品描述
      //     goods_describe: '代取快递，阿斯利康的就',
      //   },
      //   {
      //     //  商店名
      //     shop_title: "小马只运科技",
      //     //  预图片
      //     img_address: "",
      //     //  物品名
      //     goods_title: '送餐',
      //     //  物品描述
      //     goods_describe: '代取快递，阿斯利康的就',
      //   },
      //   {
      //     //  商店名
      //     shop_title: "小马只运科技",
      //     //  预图片
      //     img_address: "",
      //     //  物品名
      //     goods_title: '送餐',
      //     //  物品描述
      //     goods_describe: '代取快递，阿斯利康的就',
      //   },
      //   {
      //     //  商店名
      //     shop_title: "小马只运科技",
      //     //  预图片
      //     img_address: "",
      //     //  物品名
      //     goods_title: '送餐',
      //     //  物品描述
      //     goods_describe: '代取快递，阿斯利康的就',
      //   },
      //   {
      //     //  商店名
      //     shop_title: "最后一项",
      //     //  预图片
      //     img_address: "",
      //     //  物品名
      //     goods_title: '送餐',
      //     //  物品描述
      //     goods_describe: '代取快递，阿斯利康的就',
      //   },
      // ],
    }
  },
  methods: {
    ...mapMutations('store_user', ['updateToken']),
    select_order(index) {
      //  选择模式
      this.select = index
      //  刷新订单数据
      uni.startPullDownRefresh()
    },
    async getOrderData() {
      const {data: {code, data, msg, err}} = await uni.$httpRequest({
        url: "orders/orderGet",
        method: "post",
        data: {
          getType: this.select
        },
        header: {
          Authorization: `Bearer ${this.token}`
        }
      })
      uni.stopPullDownRefresh()
      //   判定消息
      if (!code) {
        // 如果没有密钥 那就清空token
        if (msg === '身份密钥不存在！') this.updateToken('')
        return uni.$showMsg(msg)
      }
      // 植入数据(并且翻转)
      this.orderList = data.reverse()
      console.log(data, '数据')

    },
    change_max_height() {
      //     获取container高度
      const query = wx.createSelectorQuery()

      wx.getSystemInfo().then(e => {
        console.log(e)
      })

      query.select('.container').boundingClientRect(e => {
        console.log('contianer高度', e.height)
      }).exec()
      query.select('.tab').boundingClientRect(e => {
        console.log('tab高度', e.height)
      }).exec()
    }
  },
  computed: {...mapState('store_user', ['token'])},
  mounted() {

  },
  onPullDownRefresh() {
    console.log('刷新订单')
    this.getOrderData()
  },
  onLoad() {
    this.change_max_height()
    this.getOrderData()
  },
  onShow() {
    //   下拉
    uni.startPullDownRefresh()
  }
}
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
  box-sizing: border-box;

  //  表头
  .tab {
    //  防止坍塌
    white-space: nowrap;
    //  选择对象
    .select {
      border-bottom: 3px solid orange;
      font-weight: bold;
      color: orangered;
    }

    .tab_item {
      display: inline-block;
      transition: color 0.4s;
      font-size: 40rpx;
      margin: 0 5px;
    }
  }

  //  订单组
  .content {
    //border-top: 1px solid #1FA2FF;
    padding-top: 2px;
    box-sizing: border-box;
    display: flex;
    height: calc(100% - 40rpx);

    .content_children {
      width: 100%;
    }
  }
}
</style>
