<template>
  <view class="content">
    <!--底色-->
    <view class="main">
      <!--卡片-->
      <view class="card type">
        <text :class="type === 0? 'active' : ''" @click="changeType(0)">帮我取</text>
        <text :class="type === 1? 'active' : ''" @click="changeType(1)">帮我寄</text>
      </view>
      <!--模式-->
      <view class="md">
        <view class="mode" :class="type === 0? 'mode_1' : 'mode_2'">
          <!--帮取-->
          <view class="type_1">
            <!--快递信息-->
            <view class="card info">
              <view class="card_item">
                <view class="left">取件码</view>
                <view class="right" @click="input_code">如 xx-xx-xx></view>
              </view>
              <view class="card_item">
                <view class="left">大小</view>
                <view class="right">请选择货物大小></view>
              </view>
              <view class="card_item">
                <view class="left">备注</view>
                <view class="right">如有其他注意点可以备注信息></view>
              </view>
            </view>
            <view class="card">
              <view class="card_item">
                <view class="left">收件人信息</view>
                <view class="right">></view>
              </view>
            </view>
            <view class="card">
              <view class="card_item pay">
                <view class="left">代取费：￥{{ money }}</view>
                <view class="right" @click="emit_pay">
                  支付
                </view>
              </view>
            </view>
          </view>
          <!--帮寄-->
          <view class="type_2">
            帮你寄件
          </view>
        </view>
      </view>
    </view>
    <view class="bg">
      <view class="t"></view>
      <view class="b"></view>
    </view>
  </view>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import loginYes from "../../components/loginYes/loginYes";

export default {
  data() {
    return {
      //  选择模式，如果是 0 那就是帮取  1就是帮寄件
      type: 0,
      //  取件
      tack: {
        //  取件码
        code: '',
        //  付出金额
        money: 0
      }
    }
  },
  onLoad() {

  },
  computed: {
    ...mapState('store_user', ['token']),
    money() {
      return this.tack.money.toFixed(2)
    }

  },
  methods: {
    ...mapMutations('store_user', ['updateToken']),
    //  切换模式
    async changeType(type_, e) {
      //  css上切换
      this.type = type_
    },
    //  支付
    async emit_pay() {
      //  发起支付请求！
      const {data: result_pay} = await uni.$httpRequest({
        url: 'kd/takePay',
        data: {
          //  取件信息
          take: this.tack
        },
        method: "post",
        header: {
          'Authorization': `Bearer ${this.token}` // 注意Bearer后面有一个空格
        },
      })
      if (result_pay.code) {
        //  拿到正确信息
        const info = result_pay.data.payInfo
        console.log(info)

        // 仅作为示例，非真实参数信息。
        uni.requestPayment({
          provider: 'wxpay',
          ...info,
          success: async (res) => {
            console.log('支付成功', res);
            //  支付成功后，查询订单
            const a = await uni.$httpRequest({
              //  查询快递
              url: 'kd/order_query',
              method: "post",
              header: {
                authorization: 'bearer ' + this.token
              },
              data: {
                // out_trade_no: info.out_trade_no
                out_trade_no: 1678555801885
              }
            })
            console.log(a)
          },
          fail: function (err) {
            console.log('支付失败', err);
          }
        });


      } else {
        uni.switchTab({
          url: "/pages/my/index",
          success: () => {
            this.updateToken('')
            uni.$showMsg('token已失效，请重新登陆！')
          }
        })
      }
    },
    //  输入取件码
    input_code() {
      uni.showModal({
        title: '请输入',
        editable: true,
        placeholderText: "请输入您的取件码",
        // content: '输入你的取件码',
        confirmText: '确定',
        cancelText: '取消',
        success: function (res) {
          if (res.confirm) {
            console.log(res)
            // console.log('：' + document.querySelector('input').value)
          } else {
            console.log('no')
          }
        }
      })
    },
  },
  mounted() {
    //  验证是否登陆
    const token = this.token
    if (token) {
      console.log("您还没有登陆，请先登录后再访问吧！")
      uni.switchTab({
        url: "/pages/my/index",
        success: () => uni.$showMsg("您还没有登陆，请先登录后再访问吧！")
      })

    }
  }

}
</script>

<style lang="scss">
.main {
  margin-top: 15px;
  width: 90%;
  left: 50%;
  transform: translateX(-50%);
  position: absolute;
  box-sizing: border-box;

  .type {
    text {
      color: rgb(169, 166, 167);
    }

    .active {
      padding-bottom: 5px;
      border-bottom: 5px solid rgb(233, 234, 96);
      color: black;
      font-weight: bold;
    }
  ;
    display: flex;
    justify-content: space-around;
  }

  .md {
    overflow: hidden;


    .mode {
      transition: all 0.5s;
      position: relative;

      .type_1 {
        //width: 750rpx;
        //position: absolute;
      }

      .type_2 {
        width: 100%;
        transform: translateX(100%);
        background-color: red;
        //width: 750rpx;
        position: absolute;
        top: 0;
      }
    }

    .mode_1 {
      transform: translateX(0);
    }

    .mode_2 {
      transform: translateX(-100%);
    }

  }

}

.card {
  //width: 750rpx;
  box-sizing: border-box;
  box-shadow: 0 3px 10px 1px rgba(0, 0, 0, 0.5);
  padding: 5px;
  margin-bottom: 7px;
  border-radius: 5px;
  background-color: rgb(247, 247, 247);

  .card_item {
    border-top: 1px solid rgb(114, 108, 108);
    display: flex;
    padding: 5px;
    justify-content: space-between;

    .left {
      font-weight: bold;
    }

    .right {
      font-size: 12px;
      color: #8f8f94;
    }
  }

  //  支付独立块
  .pay {

    .left {
      flex: 7;
    }

    .right {
      background-color: rgb(253, 201, 56);
      text-align: center;
      color: black;
      font-size: 15px;
      border-radius: 6px;
      flex: 3;
    }
  }

  .card_item:first-child {
    border: none;
  }

}

.pay {
  padding: 0;
}

.bg {
  .t {
    width: 750rpx;
    height: 130px;
    border-bottom-left-radius: 10%;
    border-bottom-right-radius: 10%;
    background-color: rgb(253, 201, 56);
  }
}
</style>
