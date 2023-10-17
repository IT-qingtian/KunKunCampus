<template>
  <div class="container">
    <!--导航-->
    <div class="ns">
      <uni-easyinput v-model="search_value" prefixIcon="clear" suffixIcon="search"
                     placeholder="在这里可以搜店铺或物品哦~"
                     @iconClick="search">
      </uni-easyinput>
      <!--        导航-->
      <div class="nav">
        <!--大导航-->
        <view class="nav_item" v-for='(item,index) in navData' :key="index"
              :class="nav_selected == index? 'selected' : ''" @click="navClick(item,index)">
          <i class="iconfont" :class="'icon-'+item.icon"></i>
          <text>{{ item.text }}</text>
        </view>
      </div>
      <!--        排序类别-->
      <div class="sort">
        <uni-card
            v-for="(item,index) in sort"
            :key="index"
            :class="{select_sort:index === sort_selected}"
            @click="clickSort(index)"
        >{{ item.text }}
        </uni-card>
      </div>
    </div>
    <!--店铺-->
    <scroll-view scroll-y class="shops">
      <!--            <div >-->
      <shop_item_default v-for="(data,index) in shopData_render" :key="index"
                         :componentData="data"></shop_item_default>
      <!--            </div>-->
    </scroll-view>
  </div>
</template>

<script>
// 导入uni-pay插件
import UniCard from "../../uni_modules/uni-card/components/uni-card/uni-card.vue";
import {mapState} from 'vuex'

export default {
  data() {
    return {
      search_value: '',
      // 目前选择的 导航页
      nav_selected: 0,
      // 目前选择的排序
      sort_selected: 0,
      // 导航数据
      navData: [
        {
          text: "全部",
          icon: "rishi-riquanshi"
        },
        {
          text: '周边',
          icon: '_waimai',
          id: 1
        },
        {
          text: '校内',
          icon: "chaoshi",
          id: 2
        },
        {
          text: '自营',
          icon: "xiaomaibu",
          id: 3
        }
      ],
      // 排序
      sort: [
        {
          text: "综合排序",
          fun: () => {
            this.shopData_render = this.shopData.sort((a, b) => b.id - a.id)
          }
        }, {
          text: "评分最高",
          fun: () => {
            this.shopData_render = this.shopData.sort((a, b) => b.score - a.score)
          }
        }, {
          text: "销量最高",
          fun: () => {
            this.shopData_render = this.shopData.sort((a, b) => b.sales_volume - a.sales_volume)
          }
        },
      ],
      // 商品列
      shopData: [],
      //   渲染列
      shopData_render: [],
    }
  },
  computed: {
    ...mapState('store_user', ['token'])
  },
  onLoad() {

  },
  methods: {
    clickSort(i) {
      this.sort_selected = i
      //   根据当前选择项来执行
      this.sort[this.sort_selected].fun && this.sort[this.sort_selected].fun()

      //   本地更新偏好
      uni.setStorageSync('sort_preference', i)
    },
    search(e) {
      const keyString = this.search_value
      // 还原
      this.clickSort(this.sort_selected)

      if (e === 'suffix' && keyString) {
        //   搜索
        const regexp = new RegExp(`"name":".*${keyString}.*"`)
        this.shopData_render = this.shopData_render.filter(item => {
          return item.title.includes(keyString) || regexp.test(JSON.stringify(item.goods)) || item.tags.includes(keyString)
        })
      } else {
        // 叉掉
        this.search_value = ''
      }
    },
    async navClick(item, index) {
      const {id} = item
      this.nav_selected = index
      // 根据id发给服务器 然后服务器返回 shopData数据
      const {data: {code, data, msg}} = await uni.$httpRequest({
        url: "shop/getShops",
        method: "post",
        header: {
          "authorization": `bearer ${this.token}`
        },
        data: {
          id
        }
      })
      // 错误判定
      if (!code) return uni.$showMsg(msg)
      this.shopData = data.result
      // 渲染
      this.clickSort(uni.getStorageSync('sort_preference') ?? 0)
    }
  },
  mounted() {
    this.navClick(this.navData[this.nav_selected], this.nav_selected)
  }

}
</script>

<style lang="scss" scoped>
@import url('@/static/index/iconfont/iconfont.css');

.container {
  box-sizing: border-box;
  height: 100vh;
  display: flex;
  flex-direction: column;

  .ns {
    flex: 0;
    //flex-grow: 0;
    //flex-shrink: 0;
    //flex-basis: auto;
    //  导航
    .nav {
      display: flex;
      justify-content: space-evenly;
      flex-wrap: wrap;


      .nav_item {
        transition: all 0.5s;

        display: flex;
        flex-direction: column;

        margin: 8px;
        filter: grayscale(0.7);
        opacity: 0.7;

        .iconfont {
          font-size: 80rpx;
          //opacity: 15%;
        }

        > text {
          text-align: center;
        }
      }


      //  选择模式
      .selected {
        filter: grayscale(0);
        opacity: 1;

        > text {
          font-weight: bold;
        }
      }
    }

    //  筛选
    .sort {
      .select_sort {
        color: black;
        font-weight: bold;
      }

      display: flex;

      /deep/ uni-card view {
        padding: 3px !important;
      }

      /deep/ uni-card view > view:nth-child(2) {
        display: none !important;
      }
    }
  }

  .shops {
    //flex-grow: 1;
    //flex-shrink: 0;
    //flex-basis: auto;
    flex: 1;
    overflow: hidden;
  }

}


</style>
