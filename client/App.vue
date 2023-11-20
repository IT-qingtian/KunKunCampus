<script>
import {mapState, mapMutations} from 'vuex'

export default {
  // computed: {
  //   ...mapState('store_user', ['subscribeMessages_templIDs']),
  // },
  mounted() {

  },
  methods: {
    ...mapMutations('store_user',
        [
          'updateSubscribeMessages_templIDs',
          'update_dorm_sex_group',
          'updateServiceFee',
          'get_user_address'
        ]
    ),
    // 获取基础内容
    async get_base_data() {
      const {data: {code, msg, data}} = await uni.$httpRequest({url: "my/get_base_data"})
      if (!code) return console.error('错误，无法获取到基础数据')

      const {service_fee, subScribeMesTIDS, dorm_sex_group} = data
      console.log('========')
      console.log('获取到的base数据')
      console.log(data);
      console.log('========')

      // 更新订阅消息模板ID
      this.updateSubscribeMessages_templIDs(subScribeMesTIDS)
      console.log('获取到的所有模板消息id如下：', subScribeMesTIDS)

      // 更新服务费
      this.updateServiceFee(service_fee)

      // 更新宿舍栋数分组
      this.update_dorm_sex_group(dorm_sex_group)

      // 获取地址
      this.get_user_address(true)
    },
  },
  onLaunch: function () {
    this.get_base_data()
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style lang="scss">
//  字体图标
@import url('@/static/index/iconfont/iconfont.css');
/*每个页面公共css */
@import "uview-ui/index.scss";
@import "@/static/public/css/index.scss";

</style>
