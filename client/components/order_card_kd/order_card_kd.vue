<template>
  <view class="card_order">
    <!--服务、店铺名-->
    <div class="title">
      <div class="name">取快递服务</div>
      <u-text class='state' align="right" :text="order_state"></u-text>
    </div>
    <div class="bodyer">
      <div class="content">
        <!--一般丢图片-->
        <div class="left">
          <i class="iconfont icon-kuaidi"></i>
          <!--          我是图片-->
          <!--          <img :src="item.img_address" alt="加载失败">-->
        </div>
        <!--一般丢信息-->
        <div class="right">
          <!--商品标题-->
          <!--          <div class="goods_title">{{ data.description }}</div>-->
          <!--付款描述-->
          <div class="goods_describe">
            <text>
              下单人称呼：{{
                `${data.data.user.name}${dorm_sex_group.man.includes(data.data.user.numberPlate[0] - 0) ? '先生' : '女士'}`
              }}
            </text>
            <br>
            <text>下单人电话：{{ data.data.user.phoneCode }}</text>
            <br>
            <text>下单人地址：{{ data.data.user.numberPlate }}</text>
            <br>
            <text>
              货架编号：{{ data.data.code.shelf_number }}-{{ data.data.code.layer_number }}-{{ data.data.code.number }}
            </text>
            <br>
            <text v-if="data.data.remarks">订单留言： {{ data.data.remarks }}</text>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <!--去支付-->
      <text v-if="data.payStatus==0" @click="order_pay(data.out_trade_no)">前往付款</text>
      <!--取消订单-->
      <text v-if="data.payStatus !== -1 &&data.overStatus == 0" @click="order_cancel(data.out_trade_no)">取消订单</text>
      <!--订单完成-->
      <text v-if="data.overStatus==3" @click="order_over(data.out_trade_no)">确认结单</text>
      <text v-if="order_state === '订单已取消'" @click="delete_order(data.out_trade_no)">删除订单</text>
    </div>
  </view>
</template>

<script>
import {mapState} from "vuex"

export default {
  name: "order_card_kd",
  props: {
    data: {}
  },
  data() {
    return {}
  },
  computed: {
    ...mapState('store_user', ['token', 'dorm_sex_group']),
    // 订单状态
    order_state() {
      let text = ''
      switch (this.data.payStatus) {
        case -1: {
          text = '订单已取消'
          break
        }
        case 0: {
          text = '订单未支付'
          break
        }
        case 1: {
          switch (this.data.overStatus) {
            case -1:
              text = '已退款'
              break
            case 0:
              text = '等待接单'
              break
            case 1:
              text = '取件中'
              break
            case 2:
              text = '配送中'
              break
            case 3:
              text = '已送达'
              break
            case 4:
              text = '订单已完结'
              break
          }
          break
        }
      }
      return text
    }
  },
  created() {
  },
  methods: {
    // 前往付款
    async order_pay(out_trade_no) {
      const {data: {code, msg, data: {payInfo}}} = await uni.$httpRequest({
        url: "orders/orderPay",
        method: "post",
        header: {
          Authorization: `bearer ${this.token}`
        },
        data: {out_trade_no}
      })
      // 判定是否成功
      if (!code) return uni.$showMsg(msg)
      // 判定签证信息
      if (!payInfo) return uni.$showMsg('无签证信息，无法支付订单。')

      // 调用支付
      uni.requestPayment({
        provider: "wxpay",
        ...payInfo,
        success: async (res) => {
          console.log("支付成功", res);

          //  支付成功后，查询订单
          const data = {
            //  提交刚刚的订单号 和 交易取件信息
            out_trade_no: payInfo.out_trade_no
          };

          // 订单查询
          const {data: result_qeury_data} = await uni.$httpRequest({
            //  查询快递
            url: "kd/order_query",
            method: "post",
            header: {
              authorization: "bearer " + this.token,
            },
            data,
          });
          //  告诉父组件刷新
          this.$emit("refresh_list")
        },
        fail: function (err) {
          console.log('支付失败', err)
        },
      });
    },
    // 取消订单
    order_cancel(out_trade_no) {
      uni.showModal({
        content: "确定取消订单？",
        showCancel: true,
        success: async (res) => {
          if (!res.confirm) return
          const {data: {code, msg, data}} = await uni.$httpRequest({
            url: "orders/orderCanel",
            method: "post",
            header: {
              Authorization: `bearer ${this.token}`
            },
            data: {out_trade_no}
          })
          if (!code) return uni.$showMsg(msg)
          uni.showToast({
            title: msg,
            icon: "success",
            duration: 2000
          })
          // setTimeout(() => {
          //  告诉父组件刷新
          this.$emit("refresh_list")
          // }, 2000)
        }
      })

    },
    // 确认结单
    async order_over(out_trade_no) {
      const {data: {code, msg}} = await uni.$httpRequest({
        url: "kd/end_order",
        method: "post",
        header: {
          Authorization: `bearer ${this.token}`
        },
        data: {out_trade_no}
      })
      if (!code) return uni.showToast({title: msg, icon: "error"})
      //  告诉父组件刷新
      this.$emit("refresh_list")
    },
    //   删除订单
    async delete_order(out_trade_no) {
      // 确定删除订单
      uni.showModal({
        content: "确定取消订单？",
        showCancel: true,
        success: async (res) => {
          if (!res.confirm) return
          const {data: {code, msg}} = await uni.$httpRequest({
            url: "kd/delete_order",
            method: "post",
            header: {
              Authorization: `bearer ${this.token}`
            },
            data: {out_trade_no}
          })
          if (!code) return uni.showToast({title: msg, icon: "error"})
          //  告诉父组件刷新
          this.$emit("refresh_list")
        }
      })
    }
  },
  mounted() {
  }
}
</script>

<style scoped lang="scss">
@import url('@/static/public/css/order_card.css');

.left {
  display: flex;
  justify-content: center;
  align-items: center;

  i {
    font-size: 150rpx;
  }
}
</style>