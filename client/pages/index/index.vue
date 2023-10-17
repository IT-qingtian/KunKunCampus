<template>
  <view class="content">
    <div class="notice" style="margin: 8px;width: 90%">
      <u-notice-bar text="本产品为技术联系产品，非正式运营。有任何疑问请联系作者，QQ876340000"></u-notice-bar>
    </div>

    <!--轮播图-->
    <view class="swiper">
      <view>
        <swiper indicator-dots autoplay circular>
          <swiper-item>
            <image src="@/static/index/ggzz.png"></image>
          </swiper-item>
          <swiper-item>
            <image src="@/static/index/ggzz.png"></image>
          </swiper-item>
          <swiper-item>
            <image src="@/static/index/ggzz.png"></image>
          </swiper-item>
        </swiper>
      </view>
    </view>
    <!--主要功能-->
    <view class="function">
      <view class="fun_item" v-for='(item,index) in funData' v-if="item.active" :key="index" @click="fun_run(item)">
        <i class="iconfont" :class="'icon-'+item.icon"></i>
        <text>{{ item.text }}</text>
      </view>
    </view>
    <!--        <uni-card>-->
    <!--            <text>开发中</text>-->
    <!--        </uni-card>-->
  </view>
</template>

<script>
import cfg from 'configs/configs'
import {mapMutations} from 'vuex'

console.log(cfg.serverAddress, 'dklasjdklasjdkl')
// 导入uni-pay插件
export default {
  data() {
    return {
      funData: [
        {
          text: "每日签到",
          icon: 'qiandao',
          url: "fun_qiandao",
        }, {
          text: "红包优惠",
          icon: 'hongbao',
          url: "fun_hongbao"
        }, {
          text: "超市&外卖",
          icon: 'fuwuchaoshi',
          url: "fun_chaoshi",
          active: true
        }, {
          text: "夜跑游戏",
          icon: 'paobu',
          url: "fun_paotui"
        }, {
          text: "乘网约车",
          icon: 'chuzuche',
          url: "fun_chuzuche"
        }, {
          text: "取&寄快递",
          icon: 'kuaidi',
          url: "fun_kuaidi",
          active: true
        }
      ],
      title: 'Hello'
    }
  },
  async onLoad() {
    await this.get_user_address()
  },
  methods: {
    ...mapMutations('store_user', ['updateToken', 'get_user_address']),
    //  用于转发到其他功能上面。
    fun_run(data) {
      //  打开页面
      const url = `/pages/${data.url}/index`
      data.url && uni.navigateTo({url})
      console.log("url是：", url)
      //  有单独条件就执行单独条件
      this[data.icon] && this[data.icon]()
    },
  },
  mounted() {
  }

}
</script>

<style lang="scss">
@import url('@/static/index/iconfont/iconfont.css');


.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .swiper {
    //background-color: pink;
    width: 750rpx;


    swiper-item {
      image {
        width: 750rpx;
        height: 100%;
      }
    }
  }

  .function {
    //background-color: hotpink;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    //justify-content: space-evenly;

    .fun_item {
      box-sizing: border-box;
      width: 33%;
      padding: 5px 50rpx;
      text-align: center;

      i {
        font-size: 100rpx;
      }
    }
  }
}
</style>
