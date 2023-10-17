<script setup lang="ts">

import {reactive} from "vue";
// 导入 user
import {user} from '@/store'
// 导入接口
import {run_change_work_status} from '@/server'

const {userInfo} = user()
console.log(userInfo)
console.log(userInfo.work_ing, 'o')

const data = reactive({
    is_work_ing: Boolean(userInfo.work_ing)!,
    change_work_loading: false
})

const change_work_status = async () => {
    // 改变状态
    data.change_work_loading = true
    const r_change_work = await run_change_work_status(data.is_work_ing)
    data.change_work_loading = false
    // 错误，修改无效。
    if (!r_change_work.code) {
        data.is_work_ing = !data.is_work_ing
        return uni.showToast({
            title: r_change_work.msg,
            icon: 'error',
        })
    }
    data.is_work_ing = r_change_work.data.is_work_ing
}

</script>

<template>
    <div class="user_container">
        <div class="head">
            <div class="userInfo">
                欢迎您~{{ userInfo.name }}
            </div>
            <div class="overView">
                <div class="item order_volume_day">
                    <div class="value">0</div>
                    <div class="title">今日订单</div>
                </div>
                <div class="item order_volume_month">
                    <div class="value">0</div>
                    <div class="title">本月订单</div>
                </div>
            </div>
        </div>
        <div class="shortcut">
            <div class="item">
                <div class="key">
                    <i class="iconfont icon-yundongjilu"></i>
                    <span class="describe">工作状态</span>
                </div>
                <div class="value" @click="change_work_status">
                    <el-switch v-model="data.is_work_ing" :loading="data.change_work_loading"></el-switch>
                </div>
            </div>
            <div class="item">
                <div class="key">
                    <i class="iconfont icon-paiming"></i>
                    <span class="describe">排行榜</span>
                </div>
                <div class="value">
                    <i class="iconfont icon-tiaozhuan"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.user_container {
    height: 100%;
    background-color: rgb(237, 237, 237);

    .head {
        height: 20%;
        background-color: rgb(250, 147, 23);

        .userInfo {
            height: 50%;
        }

        .overView {
            box-sizing: border-box;
            padding-bottom: 5px;
            height: 50%;
            display: flex;
            justify-content: space-around;
            align-items: flex-end;

            .item {
                font-size: 30rpx;
                display: flex;
                flex-direction: column;
                text-align: center;
                //justify-content: center;

            }
        }
    }

    .shortcut {
        height: 80%;

        .item {
            font-size: 35rpx;
            background-color: rgb(254, 254, 254);
            padding: 5px 10px;
            display: flex;
            justify-content: space-between;
            margin: 10rpx 0;

            .key {
                i {
                    font-weight: bold;
                    margin-right: 5px;
                }
            }

            .value {
            }
        }
    }

}
</style>