<script setup lang="ts">
import {onMounted, reactive} from "vue";
import {onLoad} from "@dcloudio/uni-app";
import {run_get_orders} from "@/server";

const receving = () => {

}
const callPhone = (phoneNumber: string) => {
  uni.makePhoneCall({phoneNumber})
}

const data = reactive({
  order: {data: {}}
})
let time_line_select_index = 0
const activities = [
  {
    content: '接到订单',
    timestamp: '',
  },
  {
    content: '开始配送',
    timestamp: '',
  },
  {
    content: '配送中',
    timestamp: '',
  },
  {
    content: '配送到达',
    timestamp: '',
  },
  {
    content: '订单完结',
    timestamp: '',
  },
]

// 退回
const back = (title: string) => {
  uni.showToast({title, icon: 'error'})
  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}
onLoad(async op => {
  const {out_trade_no} = op as any
  if (!out_trade_no) {
    return back('未传入订单号。')
  }
//   查询订单
  const r_order = await run_get_orders(out_trade_no)
  if (!r_order.code) return back(r_order.msg)
  data.order = r_order.data
  console.log(data.order)
})
</script>

<template>
  <div class="container">
    <div class="type"># 取货送货</div>
    <div class="info take">
      <div>
        <div class="title">
          <p><i class="iconfont icon-EBC-shouye-weiwai-shengchanbaobiao"></i>{{ data.order.data.shop_title }} <span
              style="font-size: 20px"></span></p>
          <i class="iconfont icon-lianxi" @click="callPhone('213')"></i>
        </div>
        <div class="position">
          请前往：{{ data.order.data.shop_position }}
        </div>
      </div>
    </div>
    <el-divider class="divider" border-style="dashed"></el-divider>
    <div class="info deliver">
      <div>
        <div class="title">
          <p><i class="iconfont icon-fasong"></i>{{ data.order.data.address?.name }} <span style="font-size: 20px">（{{
              data.order.data.address?.phoneCode
            }}）</span>
          </p>
          <i class="iconfont icon-lianxi"
             @click="callPhone(data.order.data.address?.phoneCode)"></i>
        </div>
        <div class="position">
          请送往：{{ data.order.data.address?.numberPlate }}
        </div>
      </div>
    </div>
    <el-divider class="divider" border-style="dashed"></el-divider>
    <div class="business">
      <span class="goods_count">共{{
          data.order.data.goods?.reduce((count, item) => {
            return count + item.number
          }, 0)
        }}件商品</span>
      <div class="goods">
        <div class="item" v-for="(item,index) in data.order.data.goods" :index="index">
          <div class="key">{{ item.name }}</div>
          <div class="value">x{{ item.number }}</div>
        </div>
      </div>
      <div class="notes" v-if="data.order.data.notes">
        备注：{{ data.order.data.notes}}
      </div>
    </div>
    <div class="control">
      <el-timeline style="margin: 8px 0;padding-left: 5px">
        <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.timestamp"
            :size='time_line_select_index == index ? "large" : "normal"'
            :color="time_line_select_index == index ? 'rgb(116,186,67)' : '#bfbfbf'"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
      <div class="receving" @click="receving">确认接单</div>
      <!--下一步-->
    </div>
  </div>
</template>

<style scoped lang="scss">
body {
  box-sizing: border-box;
  padding: 20px 0;
  background-color: rgb(244, 244, 246);
}

.container {
  background-color: #fff;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 15px;
  width: 90%;
  font-size: 40rpx;

  .info {
    .title {
      display: flex;
      justify-content: space-between;

      i {
        font-size: 50rpx;
      }
    }

    .position {
      font-size: 35rpx;
      color: #999999;
    }
  }

  .business {
    .goods {
      .item {
        margin: 5px;
        display: flex;
        justify-content: space-between;
      }
    }

    .notes {
      color: orangered;
      font-size: 35rpx;
    }
  }

  .control {
    .receving {
      text-align: center;
      margin: 8px 0;
      border-radius: 50px;
      color: white;
      box-sizing: border-box;
      padding: 5px;
      background: linear-gradient(rgb(253, 190, 27), rgb(255, 175, 1));
    }
  }


}
</style>