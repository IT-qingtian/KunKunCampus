<script setup lang="ts">
// 导入 server
import {run_get_orders} from '@/server'
import {onMounted, reactive, ref} from "vue";
import card_order_receving from '@/components/run/order/card_order_receving/index.vue'

let receving_ = ref(true)

// 二级筛选控制
const control = reactive({
    receving: {
        index: 0,
        handler: function (index: number) {
            this.index = index
        },
        // 显示条件
        view_list: [
            {
                text: "全部",
                show_require: (data: any) => {
                    return true
                }
            }, {
                text: "出单中",
                show_require: (data: any) => {
                    return data.order_over === 1
                }
            }, {
                text: "已出单",
                show_require: (data: any) => {
                    return data.order_over === 2
                }
            }
        ]
    },
    my: {
        index: 0,
        // 执行方法
        hanlder: function (index: number) {
            this.index = index
            console.log(this)
        },
        // 显示条件
        view_list: [
            {
                text: '全部',
                show_require: (data: any) => {
                    return true
                }
            }, {
                text: '出单中',
                show_require: (data: any) => {
                    //     只过滤正在出餐的
                    return data.order_over === 1
                }
            }, {
                text: '已出单',
                show_require: (data: any) => {
                    //     只过滤已经出餐的
                    return data.order_over === 2
                }
            }, {
                text: '配送中',
                show_require: (data: any) => {
                    //     只过滤配送的
                    return data.order_over === 3
                }
            }, {
                text: '已送达',
                show_require: (data: any) => {
                    //     已送达
                    return data.order_over === 4
                }
            }, {
                text: '已完成',
                show_require: (data: any) => {
                    return data.order_over === 5
                }
            }
        ]
    },
})

const change_nav = async (is_receving_: boolean) => {
    receving_.value = is_receving_
//   清空所有订单
    data.orders = []
//   根据氨情况来对应
    const r_orders = await run_get_orders('', !is_receving_)
    if (!r_orders.code) return uni.showToast({title: r_orders.msg, icon: 'none'})
    data.orders = r_orders.data
    console.log(data.orders)
}

//  我的订单，获取这个订单目前状态
const my_order_get_status = (data: any) => {
    let text = '未知状态'
    // 根据目前状态来决定状态名
    switch (data.order_over) {
        case 1:
            text = '请等待商户出单'
            break
        case 2:
            text = '请取物并开始配送'
            break
        case 3:
            text = '配送中'
            break
        case 4:
            text = '已送达'
            break
        case 5:
            text = '已完结'
            break
    }
    return text
}

const data = reactive({
    orders: []
})


onMounted(async () => {
    change_nav(receving_.value)
})

</script>

<template>
    <div class="order_container">
        <div class="nav">
            <div class="item" :class="{active: receving_}" @click="change_nav(true)">可接订单</div>
            <div class="item" :class="{active: !receving_}" @click="change_nav(false)">我的订单</div>
        </div>
        <div v-if="receving_" class="orders">
            <div class="view">
                <div class="item"
                     v-for="(item,index) in control.receving.view_list"
                     :key="index"
                     :class="{active:control.receving.index === index}"
                     @click="control.receving.handler(index)">
                    {{
                        item.text + (data.orders.filter(item_ => control.receving.view_list[index].show_require(item_)).length ? `(${data.orders.filter(item_ => control.receving.view_list[index].show_require(item_)).length})` : '')
                    }}
                </div>
            </div>
            <scroll-view scroll-y height class="order_scroll">
                <div class="item_order" v-for="item in data.orders">
                    <card_order_receving
                        v-show="control.receving.view_list[control.receving.index].show_require(item)"
                        :data=item
                        :text="`${((new Date().getTime() - new Date(item.receving_order_info?.shop_info?.receving_time).getTime()) / 1000 / 60 || 0).toFixed(0)}分钟前`"></card_order_receving>
                </div>
            </scroll-view>
        </div>
        <div v-else class="my_orders">
            <scroll-view scroll-x width="100vw">
                <div class="view">
                    <div
                        class="item"
                        v-for="(item,index) in control.my.view_list"
                        @click="control.my.hanlder(index)"
                        :class="{active:control.my.index === index}">
                        {{ item.text + (data.orders.filter(item_ => control.my.view_list[index].show_require(item_)).length ? `(${data.orders.filter(item_ => control.my.view_list[index].show_require(item_)).length})` : '') }}
                    </div>
                </div>
            </scroll-view>
            <scroll-view scroll-y height class="order_scroll">
                <div class="item_order" v-for="(item,index) in data.orders"
                     :key="index"
                     v-show="control.my.view_list[control.my.index].show_require(item)">
                    <card_order_receving
                        v-if="item.type === 3"
                        :data=item
                        :text="my_order_get_status(item)">
                    </card_order_receving>
                </div>
            </scroll-view>
        </div>
    </div>
</template>

<style scoped lang="scss">
.order_container {
    .nav {
        align-items: center;
        height: 5vh;
        display: flex;
        justify-content: space-evenly;


        .item {
            transition: all 0.2s;
            font-size: 40rpx;
        }

        .active {
            font-size: 50rpx;
            font-weight: bold;
        }
    }

    .view {
        display: flex;
        white-space: nowrap;

        .item {
            font-size: 45rpx;
            //超出不换行
            margin-right: 8px;
        }

        .active {
            font-weight: bold;
        }
    }

    background-color: rgb(244, 244, 242);
    height: 100%;

    .orders {
        .order_scroll {
            height: 80vh
        }
    }
}

</style>