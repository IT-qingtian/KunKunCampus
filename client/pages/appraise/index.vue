<script>
import {mapState} from 'vuex'
import cfg from '@/configs/configs'
import FormData from '@/formdata'

const {serverAddress} = cfg
export default {
  name: "appraise",
  computed: {
    ...mapState('store_user', ['token'])
  },
  data() {
    return {
      goods_rate: 5,
      delivery_rate: 5,
      appraise_content: "",
      fileList: [],
      is_anonymous: false,
      out_trade_no: "",
      pass: false,
    }
  },
  methods: {
    // 收货
    async order_confirm(out_trade_no) {
      const {data: {code, msg}} = await uni.$httpRequest({
        url: "orders/confirm",
        method: "post",
        header: {
          Authorization: `bearer ${this.token}`
        },
        data: {out_trade_no}
      })
      if (!code) return
      uni.$showMsg(msg)
    },
    // 评论
    async order_appraise(out_trade_no) {
      // 当处于并没有签收状态下
      if (this.pass) {
        // 收货
        await this.order_confirm(out_trade_no)
        //   关闭显示
        uni.hideToast()
      }
      const url = serverAddress + "orders/appraise"

      if (!this.appraise_content) return uni.$showMsg('请输入评论内容')

      // 带图评论
      if (this.fileList.length > 0) {
        const filePath = this.fileList[0].url
        uni.uploadFile({
          url,
          filePath,
          header: {
            Authorization: `bearer ${this.token}`
          },
          name: 'file', // 服务器接收文件的字段名
          formData: {
            out_trade_no: this.out_trade_no,
            is_anonymous: this.is_anonymous,
            appraise_content: this.appraise_content,
            goods_rate: this.goods_rate,
            delivery_rate: this.delivery_rate,
          },
          success: function (res) {
            if (!res.data.code) return uni.showToast({title: res.data.msg, icon: 'error'})
            uni.showToast({title: '评论成功'})
            setTimeout(() => {
              uni.navigateBack()
            }, 1000)
          },
          fail: function (error) {
            // 上传失败的回调函数
            console.error('上传失败', error);
          }
        });
      } else {


        //  发送 POST 请求携带表单数据
        //  out_trade_no: this.out_trade_no,
        //  is_anonymous: this.is_anonymous,
        //  appraise_content: this.appraise_content,
        //  goods_rate: this.goods_rate,
        //  delivery_rate: this.delivery_rate,
        wx.request({
          url,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'multipart/form-data; boundary=XXX'
          },
          data: '\r\n--XXX' +
              '\r\nContent-Disposition: form-data; name="out_trade_no"' +
              '\r\n' +
              '\r\n' + this.out_trade_no +
              '\r\n--XXX' +
              '\r\nContent-Disposition: form-data; name="is_anonymous"' +
              '\r\n' +
              '\r\n' + this.is_anonymous +
              '\r\n--XXX' +
              '\r\nContent-Disposition: form-data; name="appraise_content"' +
              '\r\n' +
              '\r\n' + this.appraise_content +
              '\r\n--XXX' +
              '\r\nContent-Disposition: form-data; name="goods_rate"' +
              '\r\n' +
              '\r\n' + this.goods_rate +
              '\r\n--XXX' +
              '\r\nContent-Disposition: form-data; name="delivery_rate"' +
              '\r\n' +
              '\r\n' + this.delivery_rate +
              '\r\n--XXX--', // 结束请求体
          success: function (res) {
            if (!res.data.code) return uni.showToast({title: res.data.msg, icon: 'error'})
            uni.showToast({title: '评论成功'})
            setTimeout(() => {
              uni.navigateBack()
            }, 1000)
          },
          fail: function (err) {
            console.error('请求失败', err);
          }
        })

      }
    },

    // 删除图片
    deletePic(event) {
      this.fileList.splice(event.index, 1)
    },
    // 新增图片
    async afterRead(event) {
      console.log(event)
      const file = event.file[0]
      if (file.type !== "image") return uni.$showMsg('请上传正确的图片')
      this.fileList.push(file)
    }
  },
  mounted() {

    const {out_trade_no} = this.$root.$mp.query
    if (out_trade_no === undefined) {
      uni.$showMsg('参数不齐全')
      return setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    }
    Object.assign(this, this.$root.$mp.query)
    //   参数是否齐全
  }
}
</script>
<template>
  <div class="appraise">
    <view class="item">
      <view class="key">
        <span>订单编号：</span>
      </view>
      <view class="value">
        123
      </view>
    </view>
    <view class="item">
      <view class="key">
        <span>下单时间：</span>
      </view>
      <view class="value">

      </view>
    </view>
    <view class="item">
      <view class="key">
        <span>商品评分：</span>
      </view>
      <view class="value">
        <u-rate count="5" v-model="goods_rate"></u-rate>
      </view>
    </view>
    <view class="item">
      <view class="key">
        <span>配送评分：</span>
      </view>
      <view class="value">
        <u-rate count="5" v-model="delivery_rate"></u-rate>
      </view>
    </view>
    <view class="item">
      <u-upload
          :fileList="fileList"
          @afterRead="afterRead"
          @delete="deletePic"
          :previewFullImage="true"
          name="1"
          multiple
          :maxCount="1"
      ></u-upload>
    </view>
    <!--文本-->
    <view class="item">
      <u--textarea v-model="appraise_content" placeholder="留下评论，畅所欲言" count/>
    </view>
    <view class="item">
      <u-checkbox-group v-model="is_anonymous">
        <u-checkbox label="匿名评论" name="anonymous"></u-checkbox>
      </u-checkbox-group>
    </view>
    <view class="item submit">
      <view class="t">
        <u-button type="primary" @click="order_appraise(out_trade_no)">提交评论</u-button>
      </view>
      <view class="t" v-if="pass" style="margin-left: 5px">
        <u-button type="success" @click="order_confirm(out_trade_no)">确认收货，暂不评论</u-button>
      </view>
    </view>
  </div>
</template>
<style lang="scss">
.item {
  display: flex;
  margin: 6px 0;
}

.submit {
  display: flex;

  .t {
    flex: 1;
  }
}

.appraise {
  padding: 20px;

}
</style>