<template>
  <view class="container">
    <div class="tab">
      <scroll-view scroll-x="true">
        <text class="tab_item" :class="selectType=== 0? 'select':''" @click.stop="select_order(0)">
          全部{{ len_all ? `(${len_all})` : '' }}
        </text>
        <text class="tab_item" :class="selectType=== 1? 'select':''" @click.stop="select_order(1)">
          待支付{{ len_wait_pay ? `(${len_wait_pay})` : '' }}
        </text>
        <text class="tab_item" :class="selectType=== 2? 'select':''" @click.stop="select_order(2)">
          待接单{{ len_await_receving ? `(${len_await_receving})` : '' }}
        </text>
        <text class="tab_item" :class="selectType=== 3? 'select':''" @click.stop="select_order(3)">
          处理中{{ len_processing ? `(${len_processing})` : '' }}
        </text>
        <text class="tab_item" :class="selectType=== 4? 'select':''" @click.stop="select_order(4)">
          已完成{{ len_completed ? `(${len_completed})` : '' }}
        </text>
        <text class="tab_item" :class="selectType=== 5? 'select':''" @click.stop="select_order(5)">
          待评价{{ len_comment ? `(${len_comment})` : '' }}
        </text>
      </scroll-view>
    </div>
    <div class="content">
      <orderYes class="content_children" :orderList="orderList_render" @refresh_list='getOrderData'
                v-if="orderList_render.length"></orderYes>
      <orderNo class="content_children" v-else></orderNo>
    </div>
  </view>
</template>

<script>
import {mapState, mapMutations} from "vuex"

export default {
  data() {
    return {
      selectType: 0,
      // 原始数据
      orderList: [],
      // 渲染数据
      orderList_render: []
    }
  },
  methods: {
    ...mapMutations('store_user', ['updateToken']),
    select_order(index) {
      //  选择模式
      this.selectType = index
      //  刷新订单数据
      uni.startPullDownRefresh()
    },
    async getOrderData() {
      const {data: {code, data, msg, err}} = await uni.$httpRequest({
        url: "orders/orderGet",
        method: "post",
        data: {
          getType: 0
          // getType: this.select
        },
        header: {
          Authorization: `Bearer ${this.token}`
        }
      })
      uni.stopPullDownRefresh()
      //   判定消息
      if (!code) {
        return uni.$showMsg(msg)
      }
      // 植入数据(并且翻转)
      this.orderList = data.reverse()

      console.log('请求回来的数据数据：', this.orderList, this.selectType)
      //   匹配查看类型
      switch (this.selectType) {
        case 0:// 全部
          this.orderList_render = this.get_all()
          break
        case 1://待支付
          this.orderList_render = this.get_wait_pay()
          break
        case 2://待接单
          this.orderList_render = this.get_await_receving()
          break
        case 3://处理中
          this.orderList_render = this.get_processing()
          break
        case 4://已完成
          this.orderList_render = this.get_completed()
          break
        case 5://待评价
          this.orderList_render = this.get_comment()
          break
      }
    },
    // 获取全部
    get_all() {
      return this.orderList
    },
    // 待支付
    get_wait_pay() {
      return this.orderList.filter(item => item.payStatus === 0)
    },
    // 待接单
    get_await_receving() {
      return this.orderList.filter(item => item.payStatus === 1 && item.orderStatus === 0)
    },
    // 处理中
    get_processing() {
      return this.orderList.filter(item => item.payStatus === 1 && ((item.type === 3 && item.orderStatus === 1) || (item.type === 1 && [2, 3].includes(item.orderStatus))))
    },
    // 已完成
    get_completed() {
      return this.orderList.filter(item => item.payStatus === 1 && ((item.type === 3 && [3, 4].includes(item.orderStatus)) || (item.type === 1 && [4, 5].includes(item.orderStatus))))
    },
    // 待评价
    get_comment() {
      return this.orderList.filter(item => item.payStatus === 1 && ((item.type === 3 && item.orderStatus === 4) || (item.type === 1 && item.orderStatus === 5)) && !item.appraise)
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
    },

  },
  computed: {
    ...mapState('store_user', ['token']),
    len_all() {
      return this.get_all().length
    },
    len_wait_pay() {
      return this.get_wait_pay().length
    },
    len_await_receving() {
      return this.get_await_receving().length
    },
    len_processing() {
      return this.get_processing().length
    },
    len_completed() {
      return this.get_completed().length
    },
    len_comment() {
      return this.get_comment().length
    }
  },
  mounted() {
  },
  onPullDownRefresh() {
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
