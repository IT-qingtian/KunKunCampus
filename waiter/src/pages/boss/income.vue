<script lang="ts">
import {defineComponent, onMounted, ref} from 'vue'

export default defineComponent({
  name: "income"
})

</script>

<script setup lang="ts">
import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  // 数据集组件
  DatasetComponent,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent
} from 'echarts/components';
import {LabelLayout, UniversalTransition} from 'echarts/features';
import {CanvasRenderer} from 'echarts/renderers';
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  LineSeriesOption
} from 'echarts/charts';
import type {
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption
} from 'echarts/components';
import type {
  ComposeOption,
} from 'echarts/core';

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | TitleComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
>;

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
]);


// 基于准备好的dom，初始化echarts实例
const ref_main = ref()
onMounted(() => {
  var myChart = echarts.init(ref_main.value.$el);
// 绘制图表
  myChart.setOption({
    title: {
      text: '支出对比'
    },
    tooltip: {},
    xAxis: {
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      // inverse: true
    },
    series: [
      {
        type: 'bar',
        data: [5, 20, 36, 10, 10, {
          value: 100,
          itemStyle: {
            color: "rgb(60,179,113)"
          }
        }],
        itemStyle: {
          barBorderRadius: 5,
          borderWidth: 0,
          borderType: 'solid',
          color: 'rgb(157, 218, 184)',
          borderColor: 'rgb(255,255,255)',
          // shadowColor: 'rgb(157, 218, 184)',
          shadowBlur: 1
        }
      }
    ]
  });
})

</script>

<template>
  <view class="resume">
    <view class="nav">
      <view class="item active">月账单</view>
      <view class="item">年账单</view>
    </view>
    <view class="select_date">
      <view class="time">
        2023年10月
      </view>
      <view class="mode">
        <span class="item active">收入</span>
        <span class="item">支出</span>
        <span class="item">其他</span>
      </view>
    </view>
    <view class="price">
      <view class="i">
        共支出111笔，合计
      </view>
      <view class="p">
        ￥151.11
      </view>
    </view>

  </view>
  <view class="detail">
    <view id="main" ref="ref_main">
    </view>
    <view id="goods" ref="ref_goods">
      <view class="title">排行榜</view>
      <view class="items">
        <view class="item"></view>
      </view>
    </view>

  </view>
</template>

<style scoped lang="scss">
body {
  background-color: rgb(60, 179, 113);

  .resume {
    padding: 5px;
    box-sizing: border-box;
    height: 40vh;

    .nav {
      margin-top: 15px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-evenly;

      .item {
        color: rgb(157, 218, 184);
        //color: #ffffff;
        padding-bottom: 5px;
      }

      .active {
        color: #ffffff;
        border-bottom: 3px solid;
      }
    }

    .select_date {
      padding: 5px;
      box-sizing: border-box;
      margin-top: 15px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;

      .time {
        font-size: 45rpx;
        color: #ffffff;
      }

      .mode {
        .item {
          margin: 0 10px;
          font-size: 30rpx;
          color: rgb(156, 219, 183);
        }

        .active {
          color: #ffffff;
          padding: 0 10px;
          box-sizing: border-box;
          border-radius: 15px;
          border: 1px solid #ffffff;
        }
      }
    }

    .price {
      .i {
        color: rgb(156, 219, 183);
        font-size: 30rpx;
      }

      .p {
        margin-top: 15px;
        color: #ffffff;
        font-weight: bold;
      }
    }
  }

  .detail {
    border-radius: 10px 10px 0 0;
    height: 105vh;
    background-color: #fff;

    #main {
      height: 50vh;
    }

    #goods {
      height: 50vh;
    }
  }
}
</style>