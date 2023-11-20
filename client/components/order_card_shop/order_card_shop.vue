<template>
  <view class="card_order">
    <!--服务、店铺名-->
    <div class="title">
      <div class="name">{{ data.data.shop_title }}</div>
      <div class="state">
        <u-text align="right" :text="order_state"></u-text>
      </div>
    </div>
    <div class="pay_time">
      {{ order_time }}
    </div>
    <div class="bodyer">
      <div class="content" v-for="(goods,index) in goods_data_ls" :key="index">
        <!--一般丢图片-->
        <div class="left">
          <image mode="heightFix"
                 :src='`${serverAddress}${goods.img_address[0]}`'
          ></image>

          <!--          <img :src="item.img_address" alt="加载失败">-->
        </div>
        <!--一般丢信息-->
        <div class="right">
          <div class="goods_describe">
            <div class="top">
              <div class="name">
                {{ goods.name }}
              </div>
              <div class="price">
                ￥{{ goods.price }}
              </div>
            </div>
            <div class="number">
              <div class="n">
                x{{ goods.number }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--省略标记-->
    <div class="ellipsis" v-if="!show_all">已隐藏更多...</div>
    <div class="settlement">
      总记：￥{{
        data.total / 100
      }}
    </div>
    <div class="footer">
      <!--      -1 订单已退款。-->
      <!--      0未接单，-->
      <!--      1是已接单（处理中），-->
      <!--      2 等待配送-->
      <!--      3 配送中-->
      <!--      4 处理完毕（自提/配送完毕）-->
      <!--      5 用户确认完成。-->

      <!--去支付-->
      <text v-if="data.payStatus==0 && data.overStatus === 0" @click="order_pay(data.out_trade_no)">前往付款</text>

      <!--取消订单 未接单-->
      <text v-if="data.overStatus === 0" @click="order_cancel(data.out_trade_no)">
        取消订单
      </text>

      <!--订单完成-->
      <text v-if="data.overStatus==4" @click="order_confirm(data.out_trade_no)">确认结单</text>

      <!--订单是否完成  0未接单，1是已接单，2是已完成。3是待评价 4绝对完成 5等待配送 6配送中 7请自提。-->

      <text v-if="data.overStatus==5 && data.payStatus==1 && !data.appraise" @click="order_appraise(data.out_trade_no)">
        评价此订单
      </text>

      <!--催单（付款且已接单）-->
      <text v-if="data.overStatus >0 && data.overStatus<4" @click="reminder(data.out_trade_no)">申请催单
      </text>


    </div>
  </view>
</template>

<script>
import {mapState} from "vuex"
import {serverAddress} from '@/configs/configs'

export default {
  name: "order_card_shop",
  props: {
    data: {},
  },
  data() {
    return {
      // 订单时间
      order_time: '',
      serverAddress,
      goods_data: [],
      goods_data_ls: [],
      // 是否显示全部内容   create的时候会赋值，然后再触发watch
      show_all: null
    }
  },
  computed: {
    ...mapState('store_user', ['token']),
    order_state() {
      // 订单状态，-1是取消订单 0是未支付，1是已支付，3是退款。
      let text = '未知状态'
      console.log(this.data)
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
              text = '商家处理中'
              break
            case 2:
              text = '等待配送中'
              break
            case 3:
              text = '骑手配送中'
              break
            case 4:
              if (this.data.data.take_goods_mode === 1) {
                text = `请前往店铺自提【${this.data.data.take_goods_code}】`
              } else {
                text = '订单已送达'
              }

              break
            case 5:
              text = '订单已完结'
              break
          }
          break
        }
      }
      return text
    }
  },
  methods: {
    // 催单
    async reminder(out_trade_no) {
      console.log('申请催单')
      const {code, data, msg} = await uni.$httpRequest({
        url: "orders/orderUreg",
        method: "post",
        header: {
          Authorization: `bearer ${this.token}`
        },
        data: {out_trade_no}
      })
      console.log(data)
    },
    // 前往付款
    async order_pay(out_trade_no) {
      // 跳转到详情页,可以付款。
      uni.navigateTo({
        url: `/pages/fun_chaoshi/comfirm/index?out_trade_no=${out_trade_no}`
      })
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
    async order_confirm(out_trade_no) {
      // 跳转到评论页面
      uni.navigateTo({
        url: `/pages/appraise/index?out_trade_no=${out_trade_no}&pass=true`
      })
    },
    // 评价订单
    async order_appraise(out_trade_no) {
      //  跳转到相关页面
      uni.navigateTo({
        url: `/pages/appraise/index?out_trade_no=${out_trade_no}`
      })
    }
  },
  created() {
    //   解析出商品数据
    console.log(this.data, '拿到的数据')
    // 订单时间
    if (this.data.time_pay_order) {
      const time = new Date(this.data.time_pay_order)
      this.order_time = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`
      // this.order_time = `${time.getUTCFullYear()}-${time.getUTCMonth() + 1}-${time.getUTCDate()} ${time.getUTCHours()}:${time.getUTCMinutes()}`
    }

    // 分解data
    const {goods, take_goods_mode} = this.data.data
    this.goods_data = goods
    // 商品超过多少 那就显示全部
    this.show_all = goods.length > 4 ? false : true
  },
  watch: {
    show_all(n, o) {
      if (n) this.goods_data_ls = this.goods_data
      else this.goods_data_ls = this.goods_data.slice(0, 4)
    }
  }
}
</script>

<style scoped lang="scss">
@import url("@/static/public/css/order_card.css");

.content {
  font-size: 30rpx;

  .left {
    overflow: hidden;

    image {
      // 图片居中
      position: relative;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 10px;
      height: 80rpx;
    }
  }

  .right {

    .goods_describe {
      height: 100% !important;

      .top {
        display: flex;

        .price {
          flex: 1;
          text-align: right;
        }
      }
    }
  }
}

.settlement {
  text-align: right;
}

.pay_time {
  margin: 3px auto;
  font-size: 20rpx;
  color: grey;
}
</style>