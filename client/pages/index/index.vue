<template>
  <view class="content">
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
      <view class="fun_item" v-for='(item,index) in funData' :key="index" @click="fun_run(item)">
        <i class="iconfont" :class="'icon-'+item.icont"></i>
        <text>{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script>
// 导入uni-pay插件
export default {
  data() {
    return {
      funData: [
        {
          text: "每日签到",
          icont: 'qiandao',
          url: "fun_qiandao"
        }, {
          text: "红包优惠",
          icont: 'hongbao',
          url: "fun_hongbao"
        }, {
          text: "超市购物",
          icont: 'fuwuchaoshi',
          url: "fun_chaoshi"
        }, {
          text: "跑腿送物",
          icont: 'paobu',
          url: "fun_paotui"
        }, {
          text: "乘网约车",
          icont: 'chuzuche',
          url: "fun_chuzuche"
        }, {
          text: "代取快递",
          icont: 'kuaidi',
          url: "fun_kuaidi"
        }
      ],
      title: 'Hello'
    }
  },
  onLoad() {

  },
  methods: {
    //  用于转发到其他功能上面。
    fun_run(data) {
      //  打开页面
      const url = `/pages/${data.url}/index`
      data.url && uni.navigateTo({url})
      console.log("url是：", url)
      //  有单独条件就执行单独条件
      this[data.icont] && this[data.icont]()
    },
    qiandao() {
      console.log('点击了 qiandao')
    },
    hongbao() {
      console.log('点击了 hongbao')
    },
    fuwuchaoshi() {
      console.log('点击了 fuwuchaoshi')
    },
    paobu() {
      console.log('点击了 paobu1')
    },
    chuzuche() {
      console.log('点击了 chuzuche')
    },
    kuaidi1() {
      uni.navigateTo({
        url: "/pages/kuaidi/index"
      })
      console.log('1m1o')
      //在起始页面跳转到test.vue页面并传递参数
      // uni.navigateTo({
      //   url: 'my/my'
      // });
      console.log('点击了 kuaidi1111')
    },
  },
  mounted() {
    setTimeout(() => {
      uni.navigateTo({
        url: 'pages/fun_kuaidi/index'
      })
    }, 3000)
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
    background-color: pink;
    width: 750rpx;


    swiper-item {
      image {
        width: 750rpx;
        height: 100%;
      }
    }
  }

  .function {
    background-color: hotpink;
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;

    .fun_item {
      padding: 5px 50rpx;
      text-align: center;

      i {
        font-size: 100rpx;
      }
    }
  }
}
</style>
