<template>
    <div class="container_tabbar">
        <!--渲染项-->
        <div class="item" v-for="({text,icon},index) in props.arr_page" :index="index"
             :class="{'current_select':index===props.current_index}"
             @click="change_select(index)">
            <i :class="'iconfont icon-'+icon"></i>
            {{ text }}
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, toRefs, defineComponent, defineEmits, onMounted, defineProps} from 'vue'
// 暴露组件
defineComponent({
    name: "tabBar"
})
const props = defineProps({
    arr_page: {
        type: Array
    },
    current_index: Number
})
// 传递
const emit = defineEmits(['change_tabbar_index'])


// 立即更新父页面
// emit('change_tabbar_index', 1)

function change_select(index: number) {
    // 判定是否超标
    if (index > props.arr_page.length - 1 || index < 0) return
    // 更新
    emit('change_tabbar_index', index)
}

onMounted(() => {
})

</script>

<style scoped lang="scss">
.container_tabbar {
    font-size: 45rpx;
    display: flex;
    justify-content: space-around;
}

.item {
    display: flex;
    flex-direction: column;
    text-align: center;

    i {
        font-size: 60rpx;
    }

}

.current_select {
    color: red;
}

.container_tabbar {
    padding: 5px;
}
</style>