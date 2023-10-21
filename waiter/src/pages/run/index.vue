<template>
    <div class="container_index">
        <div class="view" ref="ref_view">
            <component :is="components[current_index]"></component>
        </div>
        <div class="tab" ref="ref_tab">
            <tabBar ref="ref_tabBar" :arr_page="arr_page"
                    @change_tabbar_index="change_tabbar_index "
                    :current_index=current_index
                    value="hello"></tabBar>
        </div>
    </div>
</template>
<script setup lang="ts">

import {ref, onMounted, toRefs} from 'vue'
import {user} from '@/store'
import {run_get_user_info, run_get_orders} from '@/server'

// 引入两个组件
import order_c from '@/components/run/order/index.vue'
import user_c from '@/components/run/user/index.vue'

const store_user = user()

const components = [
    order_c,
    user_c
]

let current_index = ref(0)

const change_tabbar_index = (value: number) => {
    current_index.value = value
}
const arr_page = [
    {
        text: '订单',
        icon: "xiugaidingdan"
    },
    {
        text: '我的',
        icon: "gerenzhongxin"
    },
]

const ref_view = ref()
const ref_tab = ref()


onMounted(async () => {
    // 是否存在身份码
    if (!store_user.authorization_run) {
        console.log('没有身份码')
        return uni.navigateTo({url: '/pages/run/login'})
    }
    // ref_view.value!.style.height = `calc(100vh - ${ref_tab.value.clientHeight}px)`;
    // 获取身份信息，顺便看看token是否有效
    const check = await run_get_user_info()
    // 登陆失败
    if (!check.code) {
        console.log('登录失败')
        uni.showToast({
            title: check.msg,
            icon: "error"
        })
        return setTimeout(() => {
            uni.navigateTo({url: '/pages/run/login'})
        }, 500)
    }
    //  更新用户信息
    store_user.setUserInfo(check.data)

//     获取订单
//     const r_orders = await run_get_orders()
//     console.log(r_orders, 'ok')
});


</script>
<style scoped lang="scss">
.container_index {
    height: 100vh;

    .view {
        background-color: pink;
        height: 90vh;
    }

    .tab {
        height: 10vh;
        width: 100%;
        //position: absolute;
        bottom: 0;
    }
}

</style>