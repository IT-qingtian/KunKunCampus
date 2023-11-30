<script setup lang="ts">
import {user} from '@/store'

const store_user = user()

// 导入 组件名
import {defineComponent} from "vue";
// 获取props
const props = defineProps({
    data: Object,
    text: String
})
console.log(props.data)
const jum_detail = (out_trade_no: string) => {
    console.log('---跳转订单详情', out_trade_no)
//     跳转到详情页
    uni.navigateTo({
        url: '/pages/run/order_detail_kd_substitute?out_trade_no=' + out_trade_no
    })
}

</script>

<template>
    <div class="container_card">
        <div class="head">
            <div class="out_trade_no">
                订单号：{{ data.out_trade_no }}
            </div>
            <div class="text">
                {{ props.text }}
            </div>
        </div>
        <!--        分割线-->
        <el-divider class="divider"></el-divider>
        <div class="title">
            订单类型：{{ data.description }}
        </div>
        <div class="content">
            <div class="info">
                <div class="code">
                    取件码：{{ data.data.code.shelf_number }}-{{ data.data.code.layer_number }}-{{ data.data.code.number }}
                </div>
                <div class="end_position">
                    送&nbsp;&nbsp;&nbsp;至：{{ data.data.user.numberPlate }}
                </div>
                <div class="userInfo">
                    用户信息：{{ data.data.user.name }} {{ data.data.user.phoneCode }}
                </div>
                <div class="notes" v-if="data.data.remarks">
                    备注：{{ data.data.remarks }}
                </div>
            </div>
            <div class="control">
                <div class="price">￥{{ store_user.service_fee.kd_substitute }}</div>
                <el-button size="large" type="warning" @click="jum_detail(data.out_trade_no )">查看</el-button>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container_card {
    margin: 8px;
    padding: 5px;
    background-color: rgb(254, 255, 255);

    .head {
        display: flex;
        justify-content: space-between;
        font-size: 25rpx;
        color: #999999;

        .text {
            font-weight: bold;
            color: rgb(230, 162, 60);
        }
    }

    .divider {
        margin: 8px 0;
    }

    .title {
        font-size: 35rpx;
        font-weight: bold;
    }

    .content {
        font-size: 30rpx;
        display: flex;
        justify-content: space-between;
        // .info所有子节点
        .info {
            * {
                margin: 5px 0;
            }

            .notes {
                //    超出显示省略号
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                width: 400rpx;
                font-size: 24rpx;
            }
        }


        .control {
            font-size: 35rpx;
            text-align: center;
            color: rgb(254, 164, 9);
        }
    }
}

</style>