<template>
  <u-skeleton
      rows="3"
      title
      :loading="loading"
  >
    <div class="shopInfo">
      <!--店铺头信息-->
      <div class="head">
        <p class="title">{{ shopData.title }}
          <image mode="widthFix"
                 v-if="shopData.img_address.length"
                 :src="`${serverAddress}${shopData.img_address[0].replaceAll('\\','/')}`"
                 alt="加载图片失败"/>
        </p>
        <!--标签-->
        <div class="tags">
          <u-tag
              size="mini"
              dark
              type="warning"
              v-for="(tag,index_tag) in shopData.tags"
              :key='index_tag' :text="tag">
          </u-tag>
        </div>
        <text class="notice">
          公告：{{ shopData.notice }}
        </text>
      </div>
      <!--分页-->
      <div class="paging">
        <!--导航-->
        <div class="nav">
          <span @click="change_paging(0)" :class="{active : paging_current===0}">下单</span>
          <span @click="change_paging(1)" :class="{active : paging_current===1}">店铺评论</span>
          <span @click="change_paging(2)" :class="{active : paging_current===2}">商户信息</span>
        </div>
        <swiper class="pages" :current=paging_current @change="change_paging_swiper">
          <swiper-item>
            <div class="page placeOrder">
              <div class="shop_goods">
                <!--导航-->
                <scroll-view class="nav"
                             :style="{height: placeOrder.goods.scroll_view_height}"
                             scroll-y>
                  <ul>
                    <li v-for="(item,index) in shopData.goods" :key="index"
                        :class="{'nav_active':index===shops_index}"
                        @click='shops_select_click(index)'>
                      {{ item.title }}
                    </li>
                  </ul>
                </scroll-view>

                <scroll-view
                    :style="{height: placeOrder.goods.scroll_view_height}"
                    @scroll="scroll_goods_"
                    :scroll-into-view='placeOrder.goods.anchor_id'
                    :scroll-top="placeOrder.goods.scroll_top"
                    scroll-y class="goods">
                  <!--渲染物资-->
                  <ul>
                    <li v-for="(goods,index) in shopData.goods"
                        :id="'goods_anchor_id_'+index"
                        :key="index" class="goods_li_"
                        :style="{height:
                                          shopData.goods.length-1 === index ? (placeOrder.goods.goods_li_arr_end_height == 0?'auto': placeOrder.goods.goods_li_arr_end_height) :'auto'}"
                    >
                      <!--拿到标题-->
                      <text class="title_">{{ goods.title }}</text>
                      <!--以及商品-->
                      <ul class="goods_">
                        <li v-for="(shops,index_) in goods.goods"
                            :key="index_"
                            v-if="!shops.isOff"
                        >
                          <div>
                            <div class="img">
                              <image mode="widthFix"
                                     :src="`${serverAddress}${shops.img_address[0]}`"
                                     alt="加载图片失败"/>
                            </div>
                            <div class="describe">
                              <p class="goods_name">{{ shops.name }} <span class="sales">(月售{{
                                  shops.month_sales
                                }}份)</span></p>
                              <div class="tags_">
                                <u-tag plain
                                       v-for="(tag,index_tag) in shops.tags"
                                       :key='index_tag' :text="tag">
                                </u-tag>
                              </div>
                              <div class="price">
                                <span>售价：{{ shops.price }}</span>
                                <u-number-box
                                    slot="right-icon"
                                    v-model="shops.number"
                                    step="1"
                                    :min="0"
                                    :showMinus="shops.number > 0">
                                  <view
                                      slot="minus"
                                      class="minus"
                                  >
                                    <u-icon
                                        name="minus"
                                        size="12"
                                    ></u-icon>
                                  </view>
                                  <text
                                      slot="input"
                                      style="width: 50px;text-align: center;"
                                      class="input"
                                  >{{ shops.number }}
                                  </text>
                                  <view
                                      slot="plus"
                                      class="plus"
                                  >
                                    <u-icon
                                        name="plus"
                                        color="#FFFFFF"
                                        size="12"
                                    ></u-icon>
                                  </view>
                                </u-number-box>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                      <div class="end_" v-if="shopData.goods.length-1 === index">已经没有更多数据啦
                      </div>
                    </li>
                  </ul>
                </scroll-view>
              </div>
              <div class="settle">
                <div class="money">
                  <text>￥{{ place_order_price }}元</text>
                </div>
                <div class="over">
                  <p v-if="!place_order_price">{{ shopData.mdp }}元起送</p>
                  <p v-else-if="place_order_price < shopData.mdp">
                    差{{
                      Math.round((shopData.mdp - place_order_price) * 100) / 100
                    }}元起送</p>
                  <div v-else @click="click_place_order">确认订单</div>
                </div>
              </div>
            </div>
          </swiper-item>

          <swiper-item>
            <div class="page comment">
              <scroll-view
                  scroll-y
                  v-if="shopData.comment.length > 0"
                  :style="{height: placeOrder.goods.scroll_view_height}"
              >
                <view>
                  <!--渲染开始-->
                  <view
                      class="item"
                      v-for="(item,index) in shopData.comment"
                      :key="index">
                    <view class="head" style="display: flex;align-items: center">
                      <div class="user">
                        <u-avatar size="20" :src="item.head"></u-avatar>
                        <text class="name">{{ item.name }}</text>
                      </div>
                      <div class="time">
                        {{ item.appraise_time }}
                      </div>
                    </view>
                    <view class="body">
                      <div class="rate">
                        <u-rate
                            active-color="rgb(255,187,23)"
                            readonly="true"
                            :value="item.goods_rate">
                        </u-rate>
                      </div>
                      <view class="content">{{ item.content }}</view>
                      <view class="img" v-if="item.img">
                        <image
                            mode="widthFix"
                            :src="serverAddress + item.img.replaceAll('\\','/')"
                            @error="loadCoommentErr(item)"
                        ></image>
                        <!--                        <image-->
                        <!--                            mode="widthFix"-->
                        <!--                            :src="serverAddress + item.img.replaceAll('\\','/')"-->
                        <!--                            @error="(item.img = null)"-->
                        <!--                        ></image>-->
                      </view>
                    </view>
                  </view>
                </view>
              </scroll-view>
              <view v-else class="no_comment">
                还没有评论呢，要不要下单抢占沙发呢？~
              </view>
            </div>
          </swiper-item>

          <swiper-item>
            <div class="page merchant">
              <view class="item" v-if="shopData.address">
                <view class="key">商户地址</view>
                <view class="value">{{ shopData.address }}</view>
              </view>
              <view class="item" v-if="shopData.phone_number">
                <view class="key">商家电话</view>
                <view class="value">{{ shopData.phone_number }}</view>
              </view>
              <view class="item">
                <view class="key">营业时间</view>
                <view class="value">{{ shopData.start_time }} - {{ shopData.end_time }}</view>
              </view>
              <view class="item">
                <view class="key">营业周期</view>
                <view class="value">{{ get_trade_cycle }}</view>
              </view>
              <!--展示图-->
              <view class="t">
                展示图
              </view>
              <view class="imgs">
                <view class="img"
                      v-for="(item,index) in shopData.img_address.slice(1)"
                      :key="index"
                >
                  <image
                      mode="widthFix"
                      @click="showImg(serverAddress + item.replaceAll('\\', '/'))"
                      :src="serverAddress + item.replaceAll('\\', '/')">
                  </image>
                </view>
              </view>

            </div>
          </swiper-item>
        </swiper>
      </div>
    </div>
    <!--展示图-->
    <view class="imgShow" v-show="imgShow.is" @click="closeImgShow">
      <image :src="imgShow.address" mode="widthFix"></image>
    </view>
  </u-skeleton>

</template>
<script>
// 导入vuex
import {mapState, mapMutations} from "vuex";
// 引入配置文件
import {serverAddress} from '@/configs/configs'

export default {
  name: "index",
  data() {
    return {

      place_order_ing: false,

      // 图片展示
      imgShow: {
        // 是否展示图
        is: false,
        // 地址
        address: ""
      },

      // 分页_下单页
      placeOrder: {
        goods: {
          goods_li_arr: [],
          // 最后一个元素高度
          goods_li_arr_end_height: '0',
          anchor_id: '',
          scroll_top: "0",
          scroll_view_height: '0'
        },
      },
      // 分页——当前选择
      paging_current: 0,
      // 商品类别
      shops_index: 0,
      // 店铺信息
      shopData: {
        // 默认值
        goods: [],
        img_address: [],
        comment: [],
      },
      loading: true,
      // 服务器地址
      serverAddress
    }
  },
  async onLoad(op) {
    const {id} = op
    //     无参数的话 返回上个页面
    if (id === undefined) return uni.navigateBack()
    //     根据id去获取商店信息
    this.getShopInfo(id)

  },
  computed: {
    ...mapState('store_user', ['token']),
    place_order_price() {
      // 累计每个类
      const n = this.shopData.goods.reduce((price, class_) => {
        // 遍历每个分类里的物资
        class_.goods.map(item => {
          price += item.price * item.number
        })
        return Number(price.toFixed(2))
      }, 0)
      // 保留两位小数
      // return Math.floor(n * 100) / 100
      return n
    }
  },
  methods: {
    ...mapMutations('store_user', ['update_temp_data']),
    // 获取营业周期
    get_trade_cycle() {
      let text = ''
      const {trade_time} = this.shopData
      trade_time[1] && (text += '周一、')
      trade_time[2] && (text += '周二、')
      trade_time[3] && (text += '周三、')
      trade_time[4] && (text += '周四、')
      trade_time[5] && (text += '周五、')
      trade_time[6] && (text += '周六、')
      trade_time[0] && (text += '周日')
      return text
    },
    loadCoommentErr(e) {
      e.img = null
    },
    showImg(address) {
      this.imgShow.address = address
      this.imgShow.is = true
    },
    closeImgShow() {
      this.imgShow.is = false
    },
    // 初始化
    view_init() {
      // 处理scroll-view的适配度
      const query = uni.createSelectorQuery()
      query.select('.shop_goods').boundingClientRect(data => {
        // console.log(data)
        this.placeOrder.goods.scroll_view_height = data.height + "px"
      }).exec();

      //  分断
      const query_ = uni.createSelectorQuery()
      query_.selectAll('.goods_li_').boundingClientRect(arr => {
        // 如果没有值 那就不处理
        if (!arr.length) return console.log('错误啦')
        this.placeOrder.goods.goods_li_arr = arr
        //  处理最后一个元素高度  当最后一个盒子高度小于scroll-view的高度时，最后一个盒子为 scroll-view的高度  否则多出一截
        const end_li_h = arr.length - 1
        this.placeOrder.goods.goods_li_arr_end_height =
            parseInt(this.placeOrder.goods.goods_li_arr[end_li_h].height) <= parseInt(this.placeOrder.goods.scroll_view_height) ?
                this.placeOrder.goods.scroll_view_height : this.placeOrder.goods.goods_li_arr[end_li_h].height + 50 + 'px'
      }).exec();
    },
    // 获取店铺信息
    async getShopInfo(id) {
      const {data: {code, data, msg}} = await uni.$httpRequest({
        url: "shop/getShop",
        method: "post",
        // 携带token
        header: {
          "authorization": `bearer ${this.token}`
        },
        data: {id}
      })
      if (!code) return uni.$showMsg(msg)

      //  解析
      console.log(data.result, '店铺数据')

      // 格式化data.result 将里面的goods遍历 然后给每个goods添加一个number属性 默认值为0   赋值给 this.shopData
      data.result.goods = data.result.goods.filter(class_ => {
        // 当这个分类没有 商品时 跳过
        if (class_.goods.length) {
          class_.goods.forEach(goods_ => {
            goods_.number = 0
          })
          return class_
        }
      })


      this.shopData = data.result
      this.shopData.comment.reverse()
      this.loading = false
      console.log(this.shopData, '格式化以后的店铺数据')
      this.is_business()

      // 下次更新页面的时候 初始化
      this.$nextTick(() => {
        this.view_init()
      })
    },

    // 打样判定
    is_business() {
      const dt = new Date();
      const {start_time, end_time, trade_time} = this.shopData;
      const currentTime = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

      // 判断今天是否是工作日
      const day_ = new Date().getDay()

      if (!(currentTime >= start_time && currentTime <= end_time && trade_time[day_])) {
        uni.showToast({
          title: "店家已打样，无法点餐了",
          icon: "error"
        });
        return false
      } else {
        return true
      }
    },
    // 下单
    async click_place_order() {

      if (!this.is_business()) return


      if (this.place_order_ing) return console.log('正在下单中')
      this.place_order_ing = true

      console.log('点击下单，正在列出信息', this.shopData.goods)

      const goods = this.shopData.goods
      //     遍历goods这个数组 并取出 所有number大于0的物资
      const goods_ = goods.reduce((arr, item) => {
        item.goods.map(item_ => {
          if (item_.number > 0) {
            // 获取物品名称、价格、数量
            const {id, name, price, number} = item_
            const new_item = {id, name, price, number}
            arr.push(new_item)
          }
        })
        return arr
      }, [])
      console.log('整理好后的数据', goods_)

      // 判定是否有物资
      if (!goods_.length) return uni.$showMsg('您还没有选择想要的东西呢')

      // 创建订单，并且 办理签证信息。
      const {data: {code, data, msg}} = await uni.$httpRequest({
        url: 'shop/createOrder',
        method: "post",
        header: {
          "authorization": `bearer ${this.token}`
        },
        data: {
          shop_id: this.shopData.id,
          goods: goods_
        }
      })
      this.place_order_ing = false
      if (!code) return uni.$showMsg(msg)
      const {out_trade_no, subscribeMessageArray} = data
      // 授权订阅消息
      uni.requestSubscribeMessage({
        tmplIds: subscribeMessageArray,
        complete: (res) => {
          // 跳转到确认付款页面
          // 使用vuex  携带临时数据 payInfo
          // this.update_temp_data({pay: payInfo})
          // 跳转页面的时候 携带订单号 以便页面去查询
          uni.navigateTo({
            url: `/pages/fun_chaoshi/comfirm/index?out_trade_no=${out_trade_no}`
          })
        }
      })


    },
    // 切换分页
    change_paging(index) {
      this.paging_current = index
    },
    // 切换分页
    change_paging_swiper(e) {
      this.paging_current = e.detail.current
    },
    //     选择分类
    shops_select_click(index) {
      this.shops_index = index
      this.placeOrder.goods.scroll_with_animation = true
      this.placeOrder.goods.anchor_id = "goods_anchor_id_" + index
    },
    //   滚动_物资
    scroll_goods_(e) {

      const top = e.detail.scrollTop
      // console.log(top, this.placeOrder.goods.scroll_top)
      // this.placeOrder.goods.scroll_top = top + "px"

      // 阀
      clearTimeout(this.scroll_goods_timer)
      // 根据位置来定义shops_index
      this.scroll_goods_timer = setTimeout(() => {
        const arr = this.placeOrder.goods.goods_li_arr
        let sum = 0
        // 遍历所有分类的高度，当高度大于滚动的高度时，就是当前的分类
        for (let i = 0; i < arr.length; i++) {
          sum += arr[i].height
          if (parseInt(top) < parseInt(sum)) {
            // console.log(i)
            this.shops_index = i
            break
          } else if (parseInt(top) === parseInt(sum)) {
            this.shops_index = i + 1
            break
          }
        }
      }, 100)
    },
  },
}
</script>

<style scoped lang="scss">
//引入图标库
@import url('../../../static/index/iconfont/iconfont.css');
//@import url('@/static/index/iconfont/iconfont.css');

/deep/ .u-tag {
  position: static;
  margin: 0 2px 2px 0 !important;
}

.shopInfo {
  display: flex;
  flex-direction: column;
  height: 100vh;

  padding: 5px;
  box-sizing: border-box;

  .head {
    .title {
      position: relative;
      font-size: 65rpx;
      font-weight: bold;
      vertical-align: middle;

      image {
        margin-left: 15px;
        width: 85rpx;
        height: 85rpx;
      }
    }

    .tags {
      display: flex;

      .u-tag {
        border: 1px solid orange !important;
        color: orangered;
        border-radius: 5px;
        //box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.44);
      }
    }

    .notice {
      margin: 8px 0;
      display: block;
      //color: #8f8f94;
      font-size: 30rpx;
      max-width: 100vw;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .paging {
    flex: 1;
    display: flex;
    flex-direction: column;

    > .nav {
      margin: 12px 0 4px;
      position: relative;

      span {
        transition: all 0.5s;
        margin-right: 5px;
        color: #8f8f94;
        font-size: 45rpx;
        position: relative;
      }

      .active {
        color: black;
      }

      span::after {
        transition: all 0.5s;
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 0;
        height: 4px;
        background-color: #8f8f94;
        border-radius: 3px;
        opacity: 0;
      }

      .active::after {
        width: 100%;
        background-color: black;
        opacity: 1;
      }

    }


    .pages {
      flex: 1;

      .page {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .placeOrder {


        .shop_goods {
          display: flex;
          flex: 1;

          > .nav {
            flex: 2;
            text-align: center;
            box-sizing: border-box;
            //color: rgb(245, 245, 245);
            background-color: rgb(245, 245, 245);

            ul {
              //background-color: #e1e1e1;

              li {
                color: black;
                //background-color: white;
                padding: 10px;
                transition: all 0.5s;
                -moz-border-radius-topright: 25%;
                -moz-border-radius-bottomright: 25%;
                //border-radius: 25%;
              }

              .nav_active {
                position: relative;;
                background-color: white !important;
                //background-color: #e1e1e1 !important;
                border-radius: 0;
                //-moz-border-radius-topright: 0;
                //-moz-border-radius-bottomright: 0;
                font-weight: bold;
                color: rgb(244, 114, 92);
              }

              //  在前面加一个橙色竖条
              .nav_active::before {
                position: absolute;;
                left: 0;
                content: '';
                display: inline-block;
                height: 70%; /* 设置为与元素高度相同 */
                width: 4px; /* 设置为所需宽度 */
                border-radius: 2px;
                background-color: rgb(244, 114, 92); /* 设置为橙色 */
                vertical-align: middle; /* 使其垂直居中 */
              }
            }
          }


          > .goods {
            //max-height: 300px;

            > ul {
              //height: 300px;
              //overflow: scroll;
            }

            flex: 8;
            //display: flex;
            //flex-direction: column;
            .title_ {
              z-index: 5;
              display: flex;
              background-color: #fff;
              top: -1px;
              position: sticky;
              font-size: 35rpx;
            }

            .goods_ {
              li {
                //background-color: darkorange;
                margin-bottom: 3px;

                > div {
                  display: flex;

                  .img {
                    flex: 4;
                    overflow: hidden;
                    border-radius: 10px;

                    image {
                      //  居中
                      position: relative;
                      left: 50%;
                      top: 50%;
                      transform: translate(-50%, -50%);
                      width: 95%;
                    }
                  }

                  .describe {
                    flex: 6;

                    .goods_name {
                      font-weight: bold;
                      font-size: 30rpx;

                      .sales {
                        color: #8f8f94;
                        font-size: 15rpx;
                      }
                    }

                    .tags_ {
                      margin: 5px 0;
                      display: flex;
                      flex-wrap: wrap;

                      //  //span {
                      //  //  padding: 3px;
                      //  //  margin: 0 2px 2px 0;
                      //  //
                      //  //  border: 1px solid #8f8f94;
                      //  //  border-radius: 5px;
                      //  //}
                    }

                    .price {
                      display: flex;
                      justify-content: space-between;

                      .no_show {
                        display: none;
                      }
                    }
                  }
                }
              }
            }

            .end_ {
              text-align: center;
              color: #8f8f94;
              font-size: 30rpx;
            }
          }
        }

        .settle {
          height: 80rpx;
          display: flex;
          background-color: black;
          border-radius: 40rpx;
          line-height: 80rpx;

          .money {
            padding: 0 10px;
            color: white;
            //font-size: 100rpx;
            flex: 7;
          }

          .over {
            text-align: center;
            color: white;
            flex: 3;

            div {
              border-radius: 0 40rpx 40rpx 0;
              background-color: #d3d33f;
            }
          }
        }
      }

      .comment {
        .item {
          background-color: rgb(245, 245, 245);
          margin: 5px 0;
          padding: 5px;

          .head {
            display: flex;
            justify-content: space-between;

            .user {
              display: flex;

              .name {
                margin-left: 5px;
              }
            }
          }

          .body {
            .content {
              margin: 5px 0;
            }

            .img {
              width: 33%;

              img {
                width: 100%;
              }
            }
          }
        }
      }

      .merchant {
        .item {
          display: flex;
          padding: 8px 3px;
          border-bottom: 1px solid rgb(147, 147, 152);
          justify-content: space-between;

          .key {

          }

          .value {

          }
        }

        .t {
          font-weight: bold;
        }

        .imgs {
          display: flex;
          justify-content: space-around;

          .img {
            background-color: rgba(0, 0, 0, 0.1);

            image {
              width: 178rpx;
              //  居中
              position: relative;
              top: 50%;
              transform: translateY(-50%);
            }
          }
        }
      }
    }

  }
}

.minus {
  width: 22px;
  height: 22px;
  border-width: 1px;
  border-color: #E6E6E6;
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  border-bottom-left-radius: 100px;
  border-bottom-right-radius: 100px;
  @include flex;
  justify-content: center;
  align-items: center;
}

.plus {
  width: 22px;
  height: 22px;
  background-color: #FF0000;
  border-radius: 50%;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  justify-content: center;
  align-items: center;
}

//  图片展示
.imgShow {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100vw;
  height: 100vh;

  image {
    width: 100vw;
    //  居中
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}

</style>