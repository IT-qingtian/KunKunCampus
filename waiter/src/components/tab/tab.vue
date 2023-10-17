<template>
  <scroll-view scroll-x>
    <div class="tabs">
      <div class="tab_item"
           :class="{select:index===select_index}"
           v-for="(item,index) in props.tab_data"
           @click="select_item(index,item.fun)"
           :key="index">{{
          item.title
        }}
        <!--数量-->
        <span class="number">{{ item.data.length }}</span>
      </div>
    </div>
    <!--滑动线-->
    <div class="line">
      <div class="bg"></div>
      <div class="move" :style="{left:lineInfo.left+'px',width:lineInfo.width + 'px'}"></div>
    </div>
  </scroll-view>
</template>


<script setup lang="ts">
import {ref, defineProps, defineEmits, reactive, onMounted} from 'vue'

const emit = defineEmits(['changeTab'])

const props = defineProps({
  tab_data: Array,
  default_index: Number
})

let lineInfo = reactive({
  width: 0,
  left: 0
})

// 元素，选项卡
let els: NodeListOf<HTMLElement>

// 选择元素的索引
let select_index = ref(0)

// 选择项
const select_item = (index: number, cb?: Function) => {
  // 是否存在这个项
  if (index + 1 > els.length) return
  lineInfo.left = els[index].offsetLeft
  lineInfo.width = els[index].offsetWidth
  // 执行回调
  cb && cb()
  // 更新选项
  select_index.value = index
  emit('changeTab', index)
}
onMounted(() => {
  els = document.querySelectorAll('.tab_item')
  // 有默认选项的话，那就选择这个项
  props.default_index && select_item(props.default_index)
})

</script>


<style scoped lang="scss">

$line_height: 2px;
.line {
  position: relative;
  background-color: rgb(228, 231, 237);
  height: $line_height;

  .move {
    transition: all 0.5s;
    position: absolute;
    height: 100%;
    background-color: deepskyblue;
  }
}

.tabs {
  display: flex;
  white-space: nowrap;

  .select {
    color: deepskyblue;
  }

  .tab_item {
    position: relative;
    margin: 0 20rpx;

    .number {
      display: inline-block;
      text-align: center;
      font-size: 20rpx;
      position: absolute;
      //background-color: white;
    }
  }

  .tab_item:first-child {
    margin-left: 0;
  }

  .tab_item:last-child {
    margin-right: 0;
  }
}
</style>