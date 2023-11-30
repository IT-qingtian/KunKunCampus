<script setup lang="ts">
import {onLaunch, onShow, onHide} from "@dcloudio/uni-app";
import {onMounted} from "vue";

onLaunch(() => {
    console.log("App Launch");
});
onShow(() => {
    console.log("App Show");
});
onHide(() => {
    console.log("App Hide");
});
onMounted(async () => {
// 验证是否存在  authorization token
//   if (!store_user.authorization) {
//     console.log('未登录')
//   }
})
</script>
<style lang="scss">
@import url('//at.alicdn.com/t/c/font_4142601_6clh58ld9di.css');


body {
    font-size: 50rpx;
}
</style>
