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
                        <view class="card_item" @click="input_code">
                            <view class="left">取件码</view>
                            <view class="right">{{ take.code ? take.code : 'xxx.xxx.xxx' }}</view>
                        </view>
                        <view class="card_item">
                            <view class="left">大小</view>
                            <view class="right">请选择货物大小></view>
                        </view>
                        <view class="card_item" @click="change_remarks">
                            <view class="left">备注</view>
                            <view class="right remarks">{{ take.remarks ? take.remarks : '填写注意点>' }}</view>
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
                    <view class="card">
                        <view class="card_item pay">
                            <view class="left">代取费：￥{{ money }}</view>
                            <view class="right" @click="emit_pay"> 支付</view>
                        </view>
                    </view>
                </view>
                <!--帮寄-->
                <view class="type_2">
                    <!--快递信息-->
                    <view class="card info">
                        <view class="card_item" @click="input_code">
                            <view class="left">取件码</view>
                            <view class="right">{{ take.code }}</view>
                        </view>
                        <view class="card_item">
                            <view class="left">大小</view>
                            <view class="right">请选择货物大小></view>
                        </view>
                        <view class="card_item" @click="change_remarks">
                            <view class="left">备注</view>
                            <view class="right remarks">{{ take.remarks ? take.remarks : '填写注意点>' }}</view>
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
                    <view class="card">
                        <view class="card_item pay">
                            <view class="left">代取费：￥{{ money }}</view>
                            <view class="right" @click="emit_pay"> 支付</view>
                        </view>
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
import {mapState, mapMutations} from "vuex";
import loginYes from "../../components/loginYes/loginYes";

export default {
    data() {
        return {
            //  选择模式，如果是 0 那就是帮取  1就是帮寄件
            type: 0,
            //  取件
            take: {
                //  取件码
                code: "",
                //  备注
                remarks: "",
                //  收件人
                user: "",
            },
            //  付出金额
            money_: 0.01,
        };
    },
    onLoad() {
    },
    computed: {
        ...mapState("store_user", ["token", "userInfo"]),
        money() {
            return this.money_.toFixed(2);
        },
    },
    methods: {
        ...mapMutations("store_user", ["updateToken"]),
        //  支付
        async emit_pay() {
            //  发起支付请求！
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
            if (result_pay.code) {
                //  拿到正确信息
                const info = result_pay.data.payInfo;
                console.log(info);
                // 仅作为示例，非真实参数信息。
                uni.requestPayment({
                    provider: "wxpay",
                    ...info,
                    success: async (res) => {
                        console.log("支付成功", res);
                        //  支付成功后，查询订单
                        const data = {
                            //  提交刚刚的订单号 和 交易取件信息
                            out_trade_no: info.out_trade_no,
                            //  取件信息
                            take: this.take,
                        };
                        // 输出data
                        console.log("data:", data);
                        const {data: result_qeury_data} = await uni.$httpRequest({
                            //  查询快递
                            url: "kd/order_query",
                            method: "post",
                            header: {
                                authorization: "bearer " + this.token,
                            },
                            data,
                        });
                        console.log(data);
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
                    },
                    fail: function (err) {
                        console.log("支付失败", err);

                        uni.showModal({
                            content: "支付尚未成功，但订单已创建，您可以去我的订单中查看。若2小时内未支付，订单将自动取消。",
                            showCancel: false,
                        });
                    },
                });
            } else {
                uni.$showMsg(result_pay.msg);
                // uni.switchTab({
                //   url: "/pages/my/index",
                //   success: () => {
                //     this.updateToken("");
                //     uni.$showMsg("token已失效，请重新登陆！");
                //   },
                // });
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
        //  输入取件码
        input_code() {
            uni.showModal({
                title: "请输入您的取件码",
                editable: true,
                placeholderText: "-可以用.代替。",
                // content: '输入你的取件码',
                confirmText: "确定",
                cancelText: "取消",
                success: (res) => {
                    if (res.confirm) {
                        this.take.code = res.content;
                    } else {
                        console.log("no");
                    }
                },
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
            console.log("您还没有登陆，请先登录后再访问吧！");
            uni.switchTab({
                url: "/pages/my/index",
                success: () => uni.$showMsg("您还没有登陆，请先登录后再访问吧！"),
            });
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
    font-size: 65 rpx;

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

.card {
  //width: 750rpx;
  box-sizing: border-box;
  box-shadow: 0 3px 10px 1px rgba(0, 0, 0, 0.5);
  padding: 5px;
  margin-bottom: 7px;
  border-radius: 5px;
  background-color: rgb(247, 247, 247);
  //  每一项目
  .card_item {
    border-top: 1px solid rgb(114, 108, 108);
    display: flex;
    padding: 5px;
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
    content: "送";
    color: white;
    display: inline-block;
    text-align: center;
    width: 50 rpx;
    height: 50 rpx;
    line-height: 50 rpx;
    margin-right: 5px;
    background-color: lawngreen;
    //padding: 5px;
    border-radius: 50%;
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

.bg {
  .t {
    width: 750 rpx;
    height: 130px;
    border-bottom-left-radius: 10%;
    border-bottom-right-radius: 10%;
    background-color: rgb(253, 201, 56);
  }
}
</style>
