<template>
  <div class="container">
    <div class="content">
      <u-notify ref="uNotify"></u-notify>
      <uni-card v-if="!orderInfo.status">
        <div class="select_mode">
          <div :class="{select:orderInfo.take_goods_mode==0}" @click="orderInfo.take_goods_mode = 0">外卖
          </div>
          <div :class="{select:orderInfo.take_goods_mode==1}" @click="orderInfo.take_goods_mode = 1">自提
          </div>
        </div>
        <div class="mode">
          <!--外卖-->
          <div v-show='orderInfo.take_goods_mode===0' class="wm">
            <div v-show='orderInfo.take_goods_mode===0' class="position_select" @click="select_address">
              <!--地址选择器-->
              <u-icon name="map" color="black" size="20"></u-icon>
              <!--            地址信息-->
              <div class="position">
                <div class="position_info" v-if="userInfo.address.length">
                  {{ userInfo.address[0].numberPlate }}
                  {{ userInfo.address[0].name }}
                  {{ userInfo.address[0].phoneCode }}
                </div>
                <div class="no_position" v-else>
                  您还没有选择地址
                </div>
              </div>
              <!--            选择按钮-->
              <u-icon name="arrow-right" color="black" size="28"></u-icon>
            </div>
          </div>
          <!--自提-->
          <div v-show='orderInfo.take_goods_mode===1' class="zt">
            <p>请自行前往店铺自提 ：</p>
            {{ orderInfo.shop_position }}
          </div>
        </div>
      </uni-card>
      <uni-card v-else>
        <div>
          <!--根据 order_over 是否完成，0未接单，1是已接单，2是已完成。3是评价-->
          <div v-if="orderInfo.order_over === 0">等待接单……</div>
          <div v-else-if="orderInfo.order_over === 1">正在等待出餐</div>
          <div v-else-if="orderInfo.order_over === 2">订单已完成</div>
          <div v-else-if="orderInfo.order_over === 3">评论</div>
        </div>
      </uni-card>


      <uni-card>
        <!--商品列表-->
        <div class="goods_list">
          <div class="shop_title">
            {{ orderInfo.shop_title }}
          </div>
          <u-divider></u-divider>
          <ul>
            <li v-for="(item,index) in orderInfo.goods"
                :key="index">
              <div class="goods_item">
                <div class="img">
                  <image mode="heightFix"
                         :src="`${serverAddress}${item.img_address[0]}`"
                  ></image>
                </div>
                <div class="info">
                  <div class="title">{{ item.name }}</div>
                  <div class="number">x{{ item.number }}</div>
                </div>
                <div class="price">{{ item.price }}元</div>
              </div>
              <u-divider :dashed="true"></u-divider>
            </li>
            <li>
              <view class="other">
                <div class="key">服务费</div>
                <div class="value">{{ orderInfo.service_fee }}元</div>
              </view>
              <view class="other" v-if="!orderInfo.take_goods_mode">
                <div class="key">配送费</div>
                <div class="value">{{ orderInfo.delivery_fee }}元</div>
              </view>
            </li>
          </ul>
        </div>
      </uni-card>
      <div class="footer" v-if="!orderInfo.status">
        <uni-card>
          <u--textarea
              maxlength=20
              v-model="orderInfo.notes"
              placeholder="此处可以填写本订单备注信息"
              count>
          </u--textarea>
        </uni-card>
      </div>
    </div>


    <div class="settle" v-if="!orderInfo.status">
      <div class="money">
        <text>￥ {{
            checkout + orderInfo.service_fee + (orderInfo.take_goods_mode ? 0 : orderInfo.delivery_fee)
          }}元
        </text>
      </div>
      <div class="over">
        <div @click="pay">支付</div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapMutations} from "vuex";
import order from "../../order/index.vue";
import {serverAddress} from '@/configs/configs'

export default {
  name: "index.vue",
  data() {
    return {
      payIng: false,
      serverAddress,
      // 订单信息
      orderInfo: {
        service_fee: 0,
        delivery_fee: 0,
        take_goods_mode: 0,
        shop_id: null,
        shop_title: '',
        // 备注信息
        notes: '',
        // 物资
        goods: [],
        // 地址数据
        address: null,
        shop_position: ''
      }
    }
  },
  computed: {
    order() {
      return order
    },
    ...mapState('store_user', ['token', 'userInfo', 'temp_data']),
    // 结账
    checkout() {
      // 遍历goods
      const goods = this.orderInfo.goods

      return goods.reduce((price_, item) => {
        const {price, number} = item
        return Number((price_ + price * number).toFixed(2))
      }, 0)
    }
  },
  methods: {
    ...mapMutations('store_user', ['update_temp_data']),
    select_address() {
      // 跳转到地址选择
      uni.navigateTo({url: '/pages/fun_kuaidi_use_user/index'})
    },
    async pay() {
      // 如果正在执行那就不执行
      if (this.payIng) return
      this.payIng = true
      //  当外送时 检查地址
      if (!this.orderInfo.take_goods_mode && !this.userInfo.address.length) {
        this.payIng = false
        return this.$refs.uNotify.error('尚未填写地址，请填写地址！')
      }

      //  附带地址
      this.orderInfo.address = this.userInfo.address[0]

      // 修改订单数据
      const updateOrder = await uni.$httpRequest({
        url: "shop/change",
        method: "post",
        header: {
          'authorization': `bearer ${this.token}`
        },
        data: {
          out_trade_no: this.orderInfo.out_trade_no,
          take_goods_mode: this.orderInfo.take_goods_mode,
          address: this.orderInfo.address,
          notes: this.orderInfo.notes
        }
      })
      const {data: {code, data, msg}} = updateOrder
      if (!code) {
        this.payIng = false
        return this.$refs.uNotify.error(msg)
      }
      this.orderInfo.out_trade_no = data.out_trade_no

      console.log(data, this.orderInfo.out_trade_no)

      let visa_info = this.temp_data.pay

      // let visa_info = null
      // 检测是否携带info 没有的话就重新获取签证信息。

      if (!visa_info) {
        //  非携带签证 需要先发起请求。  订单查询
        const {data: result_visa} = await uni.$httpRequest({
          url: "orders/orderPay",
          method: "post",
          header: {
            'authorization': `bearer ${this.token}`
          },
          data: {out_trade_no: this.orderInfo.out_trade_no}
        })
        if (!result_visa.code) {
          this.payIng = false
          return this.$refs.uNotify.error(result_visa.msg)
        }
        //     更新签证信息
        visa_info = result_visa.data.payInfo
      }

      // 调用支付
      uni.requestPayment({
        provider: "wxpay",
        // 支付数据
        ...visa_info,
        // 支付成功后查询订单
        success: async (res) => {
          console.log("支付成功", res);
          //  支付成功后，查询订单
          const data = {
            //  提交刚刚的订单号 和 交易取件信息
            out_trade_no: visa_info.out_trade_no,
            //  订单信息
            orderInfo: this.orderInfo
          };
          // 输出data
          console.log("data:", data);
          const {data: result_qeury_data} = await uni.$httpRequest({
            //  查询本订单
            url: "shop/order_query",
            method: "post",
            header: {
              authorization: "bearer " + this.token,
            },
            data,
          });
          //  解析情况
          uni.showModal({
            content: result_qeury_data.msg,
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                uni.switchTab({
                  url: "/pages/index/index",
                });
              }
            },
          });
          console.log(result_qeury_data, 'ok')
        },
        fail: err => {
          console.log("支付失败", err);
          return this.$refs.uNotify.error('支付失败啦。')
        },
        complete: () => {
          this.payIng = false
        }
      })
    }
  },
  async onLoad(op) {
    let {out_trade_no} = op
    // 根据订单号查询 本订单状态。
    const {data: {code, msg, data}} = await uni.$httpRequest({
      //  查询本订单
      url: "shop/get_order_status",
      method: "post",
      header: {
        authorization: "bearer " + this.token,
      },
      data: {
        out_trade_no
      }
    });

    if (!code) return this.$refs.uNotify.error(msg)
    console.log('查询到的订单数据。', data)


    let {data: orderData, order_over, status} = data.orderInfo
    const {goods} = orderData


    //     判定参数是否整齐
    if (!goods || !orderData.shop_title) {
      // 提示参数不整齐
      return uni.navigateBack()
    }
    // 合并数据
    Object.assign(this.orderInfo, {
      // 物品
      goods,
      // 商店标题
      shop_title: orderData.shop_title,
      // 结单状况
      order_over,
      // 是否支付
      status,
      out_trade_no,
      shop_position: orderData.shop_position,
      service_fee: orderData.service_fee,
      delivery_fee: orderData.delivery_fee
    })

    console.log(this.orderInfo)

  },
}
</script>

<style scoped lang="scss">
.container {
  position: relative;
  padding: 5px;
  box-sizing: border-box;
  background-color: rgb(243, 244, 246);


  .content {
    .select_mode {
      display: flex;
      color: black;
      font-size: 35rpx;
      margin-bottom: 5px;

      div {
        box-sizing: border-box;
        padding: 8px;
        flex: 1;
        text-align: center;
      }

      .select {
        background-color: rgb(247, 241, 186);
      }
    }


    .footer {
      margin-bottom: 90rpx;
    }

    height: calc(100vh - 10px);
    overflow: scroll;

    .position_select {
      display: flex;
      justify-content: space-between;
    }

    /deep/ .u-divider {
      margin: 6px 0;
    }


    .goods_list {
      color: black;
      font-size: 35rpx;

      .other {
        font-size: 25rpx;
        display: flex;
        justify-content: space-between;
      }

      //  物资项
      .goods_item {
        margin-bottom: 4px;
        height: 60px;
        display: flex;
        //justify-content: space-between;


        .img {
          width: 20%;
          overflow: hidden;
          border-radius: 10px;

          image {
            height: 100%;
          }
        }

        .info {
          flex: 1;
          box-sizing: border-box;
          padding-left: 5px;
          position: relative;
          //  物品名
          .title {
          }

          //  数量
          .number {
            position: absolute;
            bottom: 0;
            font-size: 25rpx;
          }
        }

        .price {
          font-size: 30rpx;
          line-height: 30rpx;
        }
      }
    }
  }

  .settle {
    width: calc(100% - 10px);
    position: absolute;
    //position: sticky;
    bottom: 5px;
    height: 80rpx;
    display: flex;
    background-color: black;
    border-radius: 40rpx;
    line-height: 80rpx;

    .money {
      padding: 0 10px;
      color: white;
      //font-size: 100rpx;
      flex: 7;
    }

    .over {
      text-align: center;
      color: white;
      flex: 3;

      div {
        border-radius: 0 40rpx 40rpx 0;
        background-color: #d3d33f;
      }
    }
  }
}
</style>