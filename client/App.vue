<script>
import {mapState, mapMutations} from 'vuex'

export default {
  // computed: {
  //   ...mapState('store_user', ['subscribeMessages_templIDs']),
  // },
  mounted() {

  },
  methods: {
    ...mapMutations('store_user', ['updateSubscribeMessages_templIDs', 'get_user_address']),
    async get_subscribeMessage() {
      const {data: {code, msg, data}} = await uni.$httpRequest({url: "my/getSubscribeMesTIDS"})
      if (!code) console.error('错误，无法获取到最新 订阅消息模板组')
      // 更新订阅消息模板ID
      this.updateSubscribeMessages_templIDs(data)
      // 获取地址
      this.get_user_address()
    }
  },
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
/*每个页面公共css */
@import "uview-ui/index.scss";
@import "@/static/public/css/index.scss";

</style>
