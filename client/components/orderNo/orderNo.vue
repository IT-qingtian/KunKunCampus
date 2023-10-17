<template>
    <scroll-view scroll-y class="container">
        <div class="info_">
            <text class="iconfont icon-wushuju"></text>
            <div class="text">
                <text class="t1">这里好干净呀</text>
                <br>
                <text class="t2">要不要考虑去下个单呢~</text>
            </div>
        </div>
    </scroll-view>
</template>

<script>
export default {}
</script>

<style scoped lang="scss">
@import url('@/static/index/iconfont/iconfont.css');

.info_ {
  margin-top: 60px;
  text-align: center;
  display: flex;
  flex-direction: column;

  .iconfont {
    font-size: 150rpx;
  }

  .text {
    //:nth-child(2) {
    //  font-size: 22rpx;
    //  color: #8f8f94;
    //}

    .t1 {
      font-size: 40rpx;
    }

    .t2 {
      font-size: 32rpx;
      color: #8f8f94;
    }
  }
}
</style>
