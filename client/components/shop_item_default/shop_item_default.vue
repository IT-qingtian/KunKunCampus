<template>
  <uni-card>
    <div class="shop_content" :class="{close_mark:!in_business}" @click="show_shop(componentData.id)">
      <!--一般丢图片-->
      <div class="left">
        <image mode="widthFix" :src="`${serverAddress}${componentData.img_address[0].replaceAll('\\', '/')}`"></image>
        <!--          <img :src="item.img_address" alt="加载失败">-->
      </div>
      <!--一般丢信息-->
      <div class="right">
        <!--商店标题-->
        <div class="shop_title">
          {{ (in_business ? '' : '(已打样)') + componentData.title }}
        </div>

        <!--商店信息-->
        <div class="shop_info">
          <!--评分-->
          <div class="score_info">
            <div>
              <span class="score">{{ componentData.score }}分</span>
              <span class="sales_volume">月销量：{{ componentData.sales_volume }}单</span>
            </div>
            <span class="amount">
<!--                            每单平均消费：{{-->
              <!--                isNaN(parseFloat(componentData.amount / componentData.sales_volume).toFixed(2)) ? 0 : parseFloat(componentData.amount / componentData.sales_volume).toFixed(2)-->
              <!--              }}元-->
              每单平均消费：{{
                (componentData.amount / componentData.sales_volume).toFixed(2)
              }}元
                        </span>
            <!--起送金额-->
            <span class="mdp">起送金额：{{ componentData.mdp }}元</span>
            <!--            标签-->
            <view class="tags">
              <view class="tag"
                    v-for="(tag,index_tag) in componentData.tags"
                    :key='index_tag'>
                <u-tag
                    :text="tag" type="warning">>
                </u-tag>
              </view>
            </view>
            <!--公告-->
            <div>
              <text v-if="componentData.notice" class="notice">{{ componentData.notice.replaceAll('\n', '') }}</text>
            </div>
          </div>
        </div>
      </div>
    </div>
  </uni-card>
</template>

<script>
import {serverAddress} from '@/configs/configs'

export default {
  name: "shop_item_default",
  props: ['componentData'],
  data() {
    return {
      serverAddress,
      in_business: false
    }
  },
  methods: {
    show_shop(id) {
      uni.navigateTo({
        url: `/pages/fun_chaoshi/shop/index?id=${id}`
      })
    }
  },
  mounted() {
    console.log(this.componentData)
    console.log(this.componentData.title)
    //   判定是否处于营业时间
    const dt = new Date();
    const {start_time, end_time, trade_time} = this.componentData;
    const currentTime = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    const currentDay = dt.getDay();
    if (currentTime >= start_time && currentTime <= end_time && trade_time[currentDay]) this.in_business = true;
    // console.log(this.in_business, 'this.in_business')
  }
}
</script>

<style scoped lang="scss">
/deep/ uni-card div {
  margin: 3px;
}


//  商店
.shop_content {
  display: flex;

  .left {
    overflow: hidden;
    flex: 3;

    image {
      border-radius: 10px;
      //居中
      position: relative;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 95%;
    }
  }

  .right {
    flex: 7;
    color: black;

    .shop_title {
      font-weight: bold;
      font-size: 35rpx;
      height: 50rpx;
      line-height: 50rpx;
    }

    .shop_info {
      .score_info {
        .score {
          font-weight: bold;
          color: rgb(229, 87, 76);
        }

        display: flex;
        flex-direction: column;
        flex-shrink: 0;

        .tags {
          display: flex;

          .tag {
            margin-right: 2px;
          }
        }

        span {
          margin-right: 5px;
        }

        //    公告
        .notice {
          margin-top: 5px;
          display: inline-block;
          max-width: 370rpx;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          padding: 3px 5px;
          //  橘红色
          background-color: rgb(253, 217, 141);
          color: rgb(198, 69, 54);
        }
      }
    }
  }
}

.close_mark {
  filter: grayscale(1);
}
</style>