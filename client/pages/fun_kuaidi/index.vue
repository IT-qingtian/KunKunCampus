<template>
  <view class="content">
    <!--底色-->
    <view class="main">
      <!--卡片-->
      <view class="card type">
        <text :class="type === 0 ? 'active' : ''" @click="type = 0"
        >帮我取
        </text
        >
        <text :class="type === 1 ? 'active' : ''" @click="type = 1"
        >帮我寄
        </text
        >
      </view>
      <!--模式-->
      <view class="mode" :class="type === 0 ? 'mode_1' : 'mode_2'">
        <!--帮取-->
        <view class="type_1">
          <!--快递信息-->
          <view class="card info">
            <view class="card_item">
              <view class="left">取件码</view>
              <!--              <view class="right">{{ take.code ? take.code : 'xx.xx.xx' }}</view>-->
              <div class="right code">
                <input
                    auto-focus
                    type="number"
                    v-model="take.code.shelf_number"
                    maxlength="2"
                    :focus="code_focus===0"
                    @input="(e)=>{input_take_code(e,0,2)}"
                    @change="change_take_code(0)"
                    @focus="code_focus = 0"/>
                <span>货架</span>
                <input
                    type="number"
                    v-model="take.code.layer_number"
                    maxlength="1"
                    :focus="code_focus===1"
                    @input="(e)=>{input_take_code(e,1,1)}"
                    @change="change_take_code(1)"
                    @focus="code_focus = 1"/>
                <span>层</span>
                <input
                    type="number"
                    v-model="take.code.number"
                    maxlength="4"
                    :focus="code_focus===2"
                    @input="(e)=>{input_take_code(e,2,4)}"
                    @change="change_take_code(2)"
                    @focus="code_focus =2 "/>
                <span>号</span>
              </div>
            </view>
            <!--            <view class="card_item">-->
            <!--              <view class="left">大小</view>-->
            <!--              <view class="right">请选择货物大小></view>-->
            <!--            </view>-->
            <view class="card_item" @click="change_remarks">
              <view class="left">备注</view>
              <view class="right remarks">{{ take.remarks ? take.remarks : '您可以在此留言>' }}</view>
            </view>
          </view>
          <view class="card">
            <!--收件-->
            <view class="card_item" @click="use_user">
              <view class="left">
                <text class="deliver">收件人信息</text>
              </view>
              <view class="right">
                {{ !take.user.name ? '暂无地址 点击添加>' : take.user.name + take.user.numberPlate }}
              </view>
            </view>
          </view>
<!--          <view class="card">-->
          <!--            <view class="card_item time">-->
          <!--              <view class="left">期望到手时间：</view>-->
          <!--              <view class="right">尽快送达</view>-->
          <!--            </view>-->
          <!--          </view>-->

          <view class="card">
            <view class="card_item pay">
              <view class="left">代取费：￥{{ money }}</view>
              <view class="right" @click="emit_pay"> 付款</view>
            </view>
          </view>
          <div class="text">
            <p>* 注意：</p>
            <p>为维护他人财产安全性， 收件人姓名必须与快递收件人姓名一致。</p>
            <p>否则工作人员取件后会致电您向您证明身份。</p>
            <p>若身份证明失败，将无法取件，并且本次订单所产生金额不予退还。</p>
            <!--            <p>* 建议：您可以</p>-->
          </div>
        </view>
        <!--帮寄-->
        <view class="type_2">
          <div class="text">
            <p>* 公告：</p>
            <p>考虑到该业务的特殊性，暂不提供本服务。</p>
            <p>请敬请期待后续完善版本...</p>
          </div>
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
import {mapState, mapMutations} from "vuex";
import loginYes from "../../components/loginYes/loginYes";

export default {
  data() {
    return {
      code_focus: 0,
      // 是否可支付
      pay_: true,
      show: false,
      columns: [
        // ['小件', '算了，我估计你也不知道多大算大件']
      ],
      //  选择模式，如果是 0 那就是帮取  1就是帮寄件
      type: 0,
      //  取件
      take: {
        //  取件码
        code: {
          shelf_number: '',
          layer_number: '',
          number: '',
        },
        //  备注
        remarks: "",
        //  收件人
        user: {},
      },
    };
  },
  onLoad() {
  },
  computed: {
    ...mapState("store_user", ["token", "userInfo", 'service_fee', 'subscribeMessages_templIDs']),
    money() {
      return this.service_fee.kd_substitute?.toFixed(2);
    },
  },
  methods: {
    ...mapMutations("store_user", ["updateToken"]),
    input_take_code(e, id, maxLen) {
      const value = e.detail.value
      value.length >= maxLen && this.change_take_code(id)
    },
    change_take_code(id) {
      switch (id) {
        case 0:
          // 自己是否为空 为空就算了
          if (!this.take.code.shelf_number) return

          // 判断后续有没有空的
          if (!this.take.code.layer_number) return this.code_focus = 1
          if (!this.take.code.number) return this.code_focus = 2
        case 1:
          // 自己是否为空 为空就算了
          if (!this.take.code.layer_number) return

          // 判断后续有没有空的
          if (!this.take.code.shelf_number) return this.code_focus = 0
          if (!this.take.code.number) return this.code_focus = 2
        case 2:
          // 自己是否为空 为空就算了
          if (!this.take.code.number) return

          // 判断后续有没有空的
          if (!this.take.code.shelf_number) return this.code_focus = 0
          if (!this.take.code.layer_number) return this.code_focus = 1
        default:
          this.code_focus = -1
      }
    },
    //  支付
    async emit_pay() {

      // 查看信息
      if (Object.values(this.take.code).includes('')) return uni.showToast({title: "请填写取件码！", icon: "error"});
      if (!this.take.user.name) return uni.showToast({title: "请先选择收件人信息！", icon: "error"});

      if (!this.pay_) return
      this.pay_ = false

      // 订阅消息
      const tmplIds = [
        this.subscribeMessages_templIDs.receving_order,//已接单
        this.subscribeMessages_templIDs.delivery_over,//配送到达
        this.subscribeMessages_templIDs.cancel_order//取消接单
      ]
      await uni.requestSubscribeMessage({tmplIds})

      //  发起支付请求！生成订单
      const {data: result_pay} = await uni.$httpRequest({
        url: "kd/takePay",
        data: {
          //  取件信息
          take: this.take,
        },
        method: "post",
        header: {
          Authorization: `Bearer ${this.token}`, // 注意Bearer后面有一个空格
        },
      });
      // console.log('支付请求结果：',result_pay,result_pay)
      this.pay_ = true
      if (result_pay.code) {
        //  拿到正确信息
        const info = result_pay.data.payInfo;
        uni.requestPayment({
          provider: "wxpay",
          ...info,
          success: async (res) => {
            console.log("支付成功", res);
            //  支付成功后，查询订单
            const data = {
              //  提交刚刚的订单号 和 交易取件信息
              out_trade_no: info.out_trade_no,
            };

            const {data: result_qeury_data} = await uni.$httpRequest({
              //  查询快递
              url: "kd/order_query",
              method: "post",
              header: {
                authorization: "bearer " + this.token,
              },
              data,
            });

            uni.showModal({
              content: result_qeury_data.msg,
              showCancel: false,
              success: () => {
                uni.switchTab({
                  url: "/pages/order/index",
                });
              },
            });
          },
          fail: function (err) {
            console.log("支付失败", err);
            uni.showModal({
              content: "支付尚未成功，但订单已创建，您可以去我的订单中查看。若2小时内未支付，订单将自动取消。",
              showCancel: false,
              success: () => {
                uni.switchTab({
                  url: "/pages/order/index",
                });
              }
            });

          }
        });

      } else {
        uni.$showMsg(result_pay.msg);
      }
    },
    change_remarks() {
      uni.showModal({
        editable: true,
        success: (res) => {
          if (res.confirm) this.take.remarks = res.content
        }
      });
    },
    //  选择收件人
    use_user() {
      uni.navigateTo({
        url: "/pages/fun_kuaidi_use_user/index",
      });
    },
  },
  mounted() {
    //  验证是否登陆
    const token = this.token;
    if (!token) {
      uni.$gotoLogin()
    }
  },
  onShow() {
    this.take.user =
        JSON.stringify(this.userInfo.address) === "[]"
            ? {}
            : this.userInfo.address[0];
  }
};
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
    font-size: 55rpx;

    text {
      transition: all 0.5s;
      color: rgb(169, 166, 167);
    }

    .active {
      padding-bottom: 5px;
      border-bottom: 5px solid rgb(233, 234, 96);
      color: black;
      font-weight: bold;
    }

    display: flex;
    justify-content: space-around;
  }

  //  公共样式
  .mode {
    transition: all 0.5s;
    position: relative;

    .type_1 {
      transition: all 0.5s;
    }

    //  取件
    .type_2 {
      transition: all 0.5s;
      width: 100%;
      transform: translateX(100%);;
      position: absolute;
      top: 0;
    }
  }

  .mode_1 {
    .type_2 {
      opacity: 0;
    }

    transform: translateX(0);
  }

  .mode_2 {
    .type_1 {
      opacity: 0;
    }

    transform: translateX(-100%);
  }
}

.code {
  display: flex;
  align-items: center;

  span {
    font-size: 30rpx;
  }

  input {
    padding-left: 1px;
    border-bottom: 1px solid #999999;
    //border-radius: 5px;
    width: 3em;
  }
}

.card {
  //width: 750rpx;
  box-sizing: border-box;
  box-shadow: 3px 3px 10px 1px rgba(0, 0, 0, 0.2);
  padding: 5px;
  margin-bottom: 7px;
  border-radius: 5px;
  background-color: rgb(247, 247, 247);
  //  每一项目
  .card_item {
    border-top: 0.5px solid rgba(114, 108, 108, 0.5);
    display: flex;
    padding: 10px;
    justify-content: space-between;

    .left {
      font-weight: bold;
    }

    .right {
      //line-height: 12px;
      font-size: 12px;
      color: #8f8f94;
    }
  }

  //  备注
  .remarks {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 50%;
  }

  .deliver:before {
    //content: '*';
    //color: red;
    //  content: "送";
    //  color: white;
    //  display: inline-block;
    //  text-align: center;
    //  width: 50rpx;
    //  height: 50rpx;
    //  line-height: 50rpx;
    //  margin-right: 5px;
    //  background-color: lawngreen;
    //  //padding: 5px;
    //  border-radius: 50%;
  }

  //  收件人信息
  //.deliver {
  //  padding: 3px;
  //  margin: 0 5px;
  //  //width: 60rpx;
  //  //height: 60rpx;
  //  //content: '送';
  //  //display: block;
  //  color: white;
  //  background-color: green;
  //  border-radius: 50%;
  //}

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

  //  第一个
  .card_item:first-child {
    border: none;
  }
}

.text {
  p {
    margin: 5px 0;
  }

  margin-top: 15px;
  font-size: 35rpx;
  //font-weight: bold;
  color: rgba(0, 0, 0, 0.5);
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
