<template>
    <div class="container_index">
        <div class="view" ref="ref_view">
            <page_function v-show="index === 0"></page_function>
            <page_order v-show="index === 1"></page_order>
            <page_my v-show="index === 2"></page_my>
        </div>
        <div class="tab" ref="ref_tab">
            <tabBar :arr_page="arr_page"
                    :current_index="index" ref="ref_tabBar"
                    @change_tabbar_index="change_tabbar_index"></tabBar>
        </div>
    </div>
</template>
<script setup lang="ts">
import {ref, onMounted, toRefs} from 'vue'
// 引入store
import {user} from '@/store'

const store_user = user()

// 引入配置项
import cfg from '@/configs'

// 判定登陆状态
if (!store_user.authorization) {
    // 跳转到授权地址 https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx312e2382a20cdbce&redirect_uri=https://17xf.cq.cn&response_type=code&scope=snsapi_base&state=none#wechat_redirect
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx312e2382a20cdbce&redirect_uri=${cfg.boss.redirect_url}&response_type=code&scope=snsapi_base&state=none#wechat_redirect`
    location.href = url
}

const index = ref(1)
const arr_page = [
    {text: '功能'},
    {text: '单厅'},
    {text: '我的'},
]


// 修改显示
const change_tabbar_index = (value: number) => {
    index.value = value
}


const ref_view = ref<HTMLDivElement>()
const ref_tab = ref<HTMLDivElement>()

onMounted(() => {
    // change_tabbar_index(1)
    console.log('ok')
    ref_view.value!.style.height = `calc(100vh - ${ref_tab.value!.clientHeight}px)`;
});

</script>
<style scoped lang="scss">

.container_index {
    height: 100vh;

    .view {
        background-color: rgb(240, 239, 244);
        //height: 100%;
    }

    .tab {
        width: 100%;
        position: absolute;
        bottom: 0;
    }
}

</style>