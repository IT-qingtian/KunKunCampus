<template>
  <view class="content">
    <div class="notice" style="margin: 8px;width: 90%">
      <u-notice-bar text="程序初期阶段，功能较少，请大胆使用，我们会努力更新业务哒！！！"></u-notice-bar>
      <!--      <u-notice-bar text="尽管拼搏，琐事给我~"></u-notice-bar>-->
    </div>
    <!--轮播图-->
    <view class="swiper">
      <view>
        <swiper indicator-dots autoplay circular>
          <swiper-item v-for="(item,index) in bannerData" :key="index">
            <image :src="'/static/banner/' + item.fileName" @click="banner_click(index)"></image>
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
      a: "ggzz.png",
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
          icon: 'yuanquwaimaibeifen',
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
          text: "代取快递",
          icon: 'kuaidi',
          url: "fun_kuaidi",
          active: true
        }, {
          text: "食堂送餐",
          icon: 'a-Artboard81star-rate',
          fun: () => {
            // 跳转进商店`
            uni.navigateTo({
                  url: "/pages/fun_chaoshi/shop/index?id=0",
                  complete: () => {
                    console.log(123)
                  }
                }
            )
          },
          active: true
        }
      ],
      bannerData: [
        {
          // 图片名
          fileName: "ggzz.png",
          //   跳转地址
          url: "/pages/banner/ggzz/index"
        }, {
          // 图片名
          fileName: "zbmm.png",
          //   跳转地址
          url: "/pages/banner/zbmm/index"
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

    // 按下banner
    banner_click(index) {
      const item = this.bannerData[index]
      item.url && uni.navigateTo({
        url: item.url
      })

    },
    //  用于转发到其他功能上面。
    fun_run(data) {
      //  打开页面
      if (data.url) {
        const url = `/pages/${data.url}/index`
        data.url && uni.navigateTo({url})
        console.log("url是：", url)
      }
      //  有单独条件就执行单独条件
      data.fun && data.fun()
    },
  },
  mounted() {
  }

}
</script>

<style lang="scss">


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
