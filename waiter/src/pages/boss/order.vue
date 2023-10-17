<template>
  <div class="container_order_details">
    <div class="item" v-if="order.set_remainder">
      <div class="key">剩余时间</div>
      <div class="value"
           :style="{color:order.remainder < 60? 'red':''}"
           :class="{important:order.remainder< 60}"
      >{{ format_(order.remainder) }}
      </div>
    </div>
    <div class="item">
      <div class="key">订单状态</div>
      <div class="value" :class="{important:order.invalid}">{{ order.status }}</div>
    </div>
    <div class="item">
      <div class="key">订单名称</div>
      <div class="value">{{ order.data?.description }}</div>
    </div>
    <div class="item">
      <div class="key">订单编号</div>
      <div class="value">{{ order.data?.out_trade_no }}</div>
    </div>
    <div class="item">
      <div class="key">取货方式</div>
      <div class="value important">{{ order.data?.data.take_goods_mode ? "用户自提" : "配送上门" }}</div>
    </div>
    <div class="item">
      <div class="key">{{ order.data?.data.take_goods_mode ? "自提代码" : "配送地址" }}</div>
      <div class="value"> {{
          order.data?.data.take_goods_mode ?
              order.data?.data.take_goods_code : order.data?.data.address.numberPlate
        }}
      </div>
    </div>
    <div class="item">
      <div class="key">购买商品</div>
      <div class="value" style="width: 30%">
        <div class="goods_list">
          <div class="goods_item" v-for="(item,index) in order.data?.data.goods" :key="index">
            <div class="name">{{ item.name }}</div>
            <div class="number">x{{ item.number }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="item">
      <div class="key">价格总计</div>
      <div class="value">{{
          order.data?.data.goods.reduce((amount, item) => {
            return Number((amount + Number(item.price * item.number)).toFixed(2))
          }, 0)
        }}元<p></p></div>
      <!--      <p class="total">-->
      <!--        总记：{{-->
      <!--          order.data?.data.goods.reduce((amount, item) => {-->
      <!--            return Number((amount + Number(item.pr
      ice * item.number)).toFixed(2))-->
      <!--          }, 0)-->
      <!--        }}元-->
      <!--      </p>-->
    </div>
    <div class="item" v-if="order.data?.data.notes">
      <div class="key">用户备注</div>
      <div class="value important" style="width: 30%;">
        {{ order.data?.data.notes }}
      </div>
    </div>
    <div class="item">
      <div class="key">配送方式</div>
      <div class="value">
        <el-checkbox size="large"
                     :disabled="Boolean(order.data?.data.take_goods_mode) || (order.data?.order_over ===1 || order.is_merchant_dispatch)"
                     v-model="order.is_merchant_dispatch"
        >
          自主配送（骑手不可配送）
        </el-checkbox>
      </div>
    </div>
    <div class="item">
      <el-button size="large" type="primary" @click="contact_user(order.data?.data.address.phoneCode)">联系顾客
      </el-button>

      <!--      <el-button size="large" type="success"-->
      <!--                 @click="receving_order(<number>props.id ,order.is_merchant_dispatch)">-->
      <!--        确认接单-->
      <!--      </el-button>-->
      <el-button v-if="order.success"
                 size="large"
                 type="success"
                 @click='order.success_fun'>
        {{ order.success }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {defineComponent, onBeforeMount, onUnmounted, reactive} from 'vue'
import {
  boss_pull_order,
  boss_receving_order,
  boss_dispatch_order,
  boss_over_order
} from '@/server'

defineComponent({
  name: "order"
})

// 订单
const order = reactive({
  djs: 0,
  success: "success",
  success_fun: null as any,
  status: "",
  // 数据
  data: null as any,


  // 自配送
  is_merchant_dispatch: false,


  // 无效标记
  invalid: false,

  // 标记剩余时间
  set_remainder: 0,
  // 起始时间
  time_qs: '',
  // 目前剩余时间
  remainder: 0,
})

// 获取路由参数
const props = defineProps({
  id: String
})

// 秒转分 格式化
const format_ = (s: number) => {
  const s_ = s % 60
  const m_ = s / 60
  return `${Math.floor(m_)}分:${s_}秒`
}

onBeforeMount(async () => {
  // 如果没有id 那就返回主页
  if (!props.id) return uni.navigateTo({url: '/pages/boss/index'})

  // 拉取数据
  const {code, data, msg} = await boss_pull_order(props.id)

  if (!code) return console.log(msg)

  order.data = data

  order.is_merchant_dispatch = order.data.receving_order_info?.is_merchant_dispatch


  console.log('订单数据', order.data)
  switch (data.order_over) {
    case 0:
      order.status = '等待接单'
      order.success = '确认接单'
      order.success_fun = receving_order
      order.time_qs = data.time_pay_order
      //  五分钟
      order.set_remainder = 5 * 60
      break
    case 1:
      order.status = '订单处理中'
      order.success = '商品已备好'
      //   根据是否自配送切换函数
      order.success_fun = dispatch_order
      order.time_qs = data.time_pay_order
      order.set_remainder = 2000 * 60
      break
    case 2:
      order.status = '等待配送'
      order.success = '开始配送'
      order.success_fun = dispatch_order
      break
    case 3:
      order.status = '配送中'
      order.success = '配送完成'
      order.success_fun = over_order
      order.time_qs = data.time_pay_order
      order.set_remainder = 20 * 60
      break
    case 4:
      order.status = '订单处理完毕'
      order.success = ''
      break
    case 5:
      order.status = '订单已完成'
      order.success = ''
      break
    case -1:
      order.status = '订单已退款'
      order.success = ''
      break
    default:
      order.status = '未知状态'
      order.success = ''
  }

  // 如果有时间限制
  if (order.set_remainder) {
    // 之前时间戳
    const before_time = new Date(order.time_qs.slice(0, -1)).getTime()
    // 时间戳间隔(秒)
    const pass_time = (new Date().getTime() - before_time) / 1000
    //   如果时间已经过了
    if (pass_time >= order.set_remainder) {
      order.remainder = 0
      // uni.showToast({
      //   title: '订单已过期',
      //   icon: 'error'
      // })
      order.invalid = true
      // 刷新页面
      // location.reload()
      return
    } else {
      order.remainder = Math.floor(order.set_remainder - pass_time)
      //   开启倒计时 目前时间减去支付时间
      order.djs = setInterval(() => {
        // 间隔秒
        const pass_time = (new Date().getTime() - before_time) / 1000
        if (pass_time >= order.set_remainder) {
          uni.showToast({
            title: '订单已过期',
            icon: 'error'
          })
          order.invalid = true
          clearInterval(order.djs)
          return
        } else {
          order.remainder = Math.floor(order.set_remainder - pass_time)
        }
        // uni.showToast({
        //   title: '订单已过期',
        //   icon: 'none'
        // })
      }, 1000)
    }

  }
})
// 销毁页面
onUnmounted(() => {
  clearInterval(order.djs)
})

// 联系客户
const contact_user = (phoneNumber: string) => {
  if (!phoneNumber) return uni.showToast({
    title: "用户并未留下电话号码~",
    icon: "error"
  })
  uni.makePhoneCall({
    phoneNumber
  })
}

// 返回
function success_back() {
  uni.showToast({
    title: '接单成功',
    icon: 'success'
  })
  // 获取栈实例
  let pages = getCurrentPages()
  // 如果只有一个路由 那就是直接进来的 需要返回单厅       否则返回上一页
  pages.length === 1 ? uni.navigateTo({url: '/pages/boss/index'}) : uni.navigateBack()
}

// 接单
const receving_order = async () => {
  // 校验是否过期
  if (order.invalid) return uni.showToast({
    title: '接单无效，订单已过期！',
    icon: 'error'
  })
  const {code, data, msg} = await boss_receving_order(order.data.out_trade_no, order.is_merchant_dispatch)
  // ElMessage({
  //   message: 'Congrats, this is a success message.',
  //   type: 'success',
  // })
  if (!code) return uni.showToast({
    title: msg,
    icon: 'none'
  })
  success_back()
}

// 订单配送（处理完）订单
const dispatch_order = async () => {
  const {code, data, msg} = await boss_dispatch_order(order.data.out_trade_no)
  if (!code) return uni.showToast({
    title: msg,
    icon: 'error'
  })
  success_back()
}

// 完成订单
const over_order = async () => {
  const {code, data, msg} = await boss_over_order(order.data.out_trade_no)
  // ElMessage({
  //   message: 'Congrats, this is a success message.',
  //   type: 'success',
  // })
  if (!code) return uni.showToast({
    title: msg,
    icon: 'none'
  })
  success_back()
}

</script>

<style scoped lang="scss">
.container_order_details {
  border-radius: 5px;
  padding: 5px;
  margin: 15px;
  box-sizing: border-box;
  //background-color: red;
  box-shadow: rgba(0, 0, 0, 0.5) 0 0 30px 2px;

  //.el-checkbox {
  //  font-size: 50rpx;
  //}

  .item {
    justify-content: space-around;
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid rgb(243, 243, 243);

    .key {
      color: rgb(166, 166, 166);
      flex: 3;
    }

    .value {
      overflow-wrap: break-word;
      padding-left: 3px;
      flex: 7;
      font-size: 40rpx;
    }
  }

  .important {
    font-weight: bold;
  }

  //  商品列
  .goods_list {
    .goods_item {
      display: flex;

      .name {
        flex: 1;
      }

      .number {
        flex: 1;
        text-align: right;
      }
    }
  }
}

.el-button {
  font-size: 50rpx;
}

</style>