<script>
export default {
  name: "index",
  data() {
    return {}
  },
  onLoad(e) {
    console.log('OK', e)
    console.log(';===========')
    console.log(this.$refs)
    console.log(';===========')
  }
}
</script>

<template>
  <div>
    <p>广告赞助</p>
    <span ref="demo"></span>
  </div>
</template>

<style scoped lang="scss">

</style>