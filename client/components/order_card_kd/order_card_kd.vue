<template>
  <view class="card_order">
    <!--服务、店铺名-->
    <div class="title">
      <div class="name">坤坤校园</div>
      <u-text class='state' align="right" :text="order_state"></u-text>
    </div>
    <div class="bodyer">
      <div class="content">
        <!--一般丢图片-->
        <div class="left">
          我是图片
          <!--          <img :src="item.img_address" alt="加载失败">-->
        </div>
        <!--一般丢信息-->
        <div class="right">
          <!--商品标题-->
          <div class="goods_title">{{ data.description }}</div>
          <!--付款描述-->
          <div class="goods_describe">
            <text>
              下单人称呼：{{
                `${data.data.user.name}${data.data.user.sex ? '先生' : '女士'}`
              }}
            </text>
            <br>
            <text>下单人电话：{{ data.data.user.phoneCode }}</text>
            <br>
            <text>下单人舍号：{{ data.data.user.numberPlate }}</text>
            <br>
            <text>
              取件编码：{{ data.data.code }}
            </text>
            <br>
            <text>订单留言： {{ data.data.remarks }}</text>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <!--去支付-->
      <text v-if="data.payStatus==0" @click="order_pay(data.out_trade_no)">前往付款</text>
      <!--取消订单-->
      <text v-if="data.overStatus == 0" @click="order_cancel(data.out_trade_no)">取消订单</text>
      <!--订单完成-->
      <text v-if="data.overStatus==4" @click="order_over">确认结单</text>
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
    return {
      // 订单状态
      order_state: ''
    }
  },
  computed: {
    ...mapState('store_user', ['token'])
  },
  created() {
    switch (this.data.overStatus) {
      case -1:
        this.order_state = '已退款'
        break
      case 0:
        this.order_state = '等待接单'
        break
      case 1:
        this.order_state = '已接单，等待区间'
        break
      case 2:
        this.order_state = '等待配送中'
        break
      case 3:
        this.order_state = '骑手配送中'
        break
      case 4:
        this.order_state = '已送达'
        break
      case 5:
        this.order_state = '订单已完成'
        break
    }
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
            url: "orders/orderQuery",
            method: "post",
            header: {
              authorization: "bearer " + this.token,
            },
            data,
          });
          console.log(result_qeury_data);
          if (!result_qeury_data.code) return uni.$showMsg(result_qeury_data.msg)
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
          //  告诉父组件刷新
          this.$emit("refresh_list")
        }
      })

    },
    // 确认结单
    order_over() {
    },
  },
  mounted() {
  }
}
</script>

<style scoped>
@import url("@/static/public/css/order_card.css");

</style>