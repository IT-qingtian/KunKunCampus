<template>
  <div class="container">
    <!--渲染数据-->
    <scroll-view scroll-y :scroll-top="scrollTop" :class="startHideShow ? 'startHideShow':''" @scroll="scroll">
      <div class="card" v-for="(item,index) in userInfo.address" :key="index" @click="select_item(index,item.id)">
        <div class="top">
          <div class="nameAndPhoneCode">
            <span class="name">{{ item.name }}</span>
            <span class="phoneCode">{{ item.phoneCode }}</span>
          </div>
          <div class="address">
            <span> 门牌号：{{ item.numberPlate }}</span>
          </div>
        </div>
        <div class="bottom">
          <text class="iconfont icon-edit-1-copy" @click.stop="item_modify(index,item.id)"></text>
          <text class="iconfont icon-shanchu" @click.stop="item_delete(index,item.id)"></text>
        </div>
      </div>
    </scroll-view>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  data() {
    return {
      //  滚动条y位置
      scrollTop: 0,
      //  是否 隐藏再显示滚动条
      startHideShow: 0
    }
  },
  computed: {
    ...mapState('store_user', ['token', 'userInfo'])
  },
  methods: {
    //  修改数据
    item_modify(index, id) {
      // e.stopPropagation()
      //  携带参数 切换到新增数据
      const data = `?modifyId=${index}&id=${id}`
      uni.navigateTo({
        url: "/pages/fun_kuaidi_add_address/index" + data
      })
    },
    //  删除数据
    async item_delete(index, id) {
      // 给服务器发起删除请求。
      const {data: {code, msg, data}} = await uni.$httpRequest({
        url: "user/user_delete_address",
        method: "post",
        header: {
          'Authorization': `Bearer ${this.token}`
        },
        data: {
          id: id
        }
      })

      if (!code) return uni.$showMsg(msg)

      uni.hideToast()

      //  剪切数据
      const address = this.userInfo.address
      address.splice(index, 1)
    },
    scroll: function (e) {
      this.scrollTop = e.detail.scrollTop;
    },
    //  选择默认地址
    async select_item(index, id) {
      this.startHideShow = 1
      this.$nextTick(function () {
        this.scrollTop = 0
      });

      // 告诉服务器 设置默认位置
      const {data: {code, msg, data}} = await uni.$httpRequest({
        method: 'post',
        url: 'user/select_default_address',
        data: {
          id
        },
        header: {
          'Authorization': `Bearer ${this.token}`
        },
      })
      if (code) {
        //  剪切出当前 然后复制到最前列
        const address = this.userInfo.address
        const el = address.splice(index, 1)
        // 更新这个数据的id
        el[0].id = data.id
        address.unshift(el[0])
        uni.hideToast()
      } else {
        // 错误提示
        uni.$showMsg(msg)
      }
      this.startHideShow = 0
    }
  },
  mounted() {
    console.log(this.userInfo.address, "address")
  }
}
</script>

<style scoped lang="scss">
@import url('@/static/index/iconfont/iconfont.css');

@keyframes startHideShow {
  0% {
    opacity: 1;
  }
  90% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.container {
  .startHideShow {
    //transition: all 0.5s;
    animation: startHideShow 0.3s linear;
  }

  //background-color: red;
  scroll-view {
    height: 80vh;
    //margin-bottom: 50px;
  }
}

.card {
  opacity: 0.5;
  margin-bottom: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  //align-content: center;

  .top {
    display: flex;
    flex-direction: column;

    .nameAndPhoneCode {
      .name {
        font-weight: bold;
      }

      .phoneCode {
        color: #8f8f94;
        //font-size: 60rpx;
      }
    }

    .address {

    }
  }

  .bottom {

    padding-top: 5px;
    border-top: 1px solid dodgerblue;
    text-align: right;

    text {
      font-size: 50 rpx;
    }

    text:first-child {
      margin-right: 8px;
    }
  }
}

.card:first-child {
  opacity: 1;
  border: 1px solid blue;
}
</style>
