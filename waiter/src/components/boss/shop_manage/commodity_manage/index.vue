<template>
    <div class="custom_shop_manage">
        <el-dialog
            v-model="data.dialogue_data.visible"
            :title=data.dialogue_data.title
            width="50%"
        >
            <span>{{ data.dialogue_data.content }}</span>
            <template #footer>
        <span class="dialog-footer">
          <el-button type="success" @click="data.dialogue_data.confirm ">
            确定
          </el-button>
          <el-button type="info" @click="data.dialogue_data.cancel">
            取消
          </el-button>
        </span>
            </template>
        </el-dialog>
    </div>
    <div class="bodyer">
        <div class="operate" @click.stop>
            <scroll-view scroll-x width="100vw">
                <div class="container">
                    <div class="item" :class="data.state_index===0 ? 'select':''" @click="select_state(0);">全部({{
                            data.goods[data.select_index].goods.length
                        }})
                    </div>
                    <div class="item" :class="data.state_index===1 ? 'select':''" @click="select_state(1)">售卖中({{
                            data.goods[data.select_index].goods.reduce((all: number, gs_item: any) => gs_item.isOff ? all : ++all, 0)
                        }})
                    </div>
                    <div class="item" :class="data.state_index===2 ? 'select':''" @click="select_state(2)">已下架({{
                            data.goods[data.select_index].goods.reduce((all: number, gs_item: any) => gs_item.isOff ? ++all : all, 0)
                        }})
                    </div>
                    <div class="item" :class="data.state_index===3 ? 'select':''" @click="select_state(3)">已售空({{
                            data.goods[data.select_index].goods.reduce((all: number, gs_item: any) => gs_item.inventory > 0 ? all : ++all, 0)
                        }})
                    </div>
                </div>
            </scroll-view>
        </div>

        <div class="content">
            <!--分组-->
            <div class="group">
                <scroll-view scroll-y>
                    <div class="item" v-for="(item,index) in data.goods" :key="index"
                         :class="{select:index===data.select_index}"
                         @click="change_nav(index)">
                        {{ item.title }} ({{ item.goods.length }})
                    </div>
                    <div class="new_group">
                        <div class="text" @click="add_group">
                            ＋新建分组
                        </div>
                        <div class="input" @blur.native.capture="add_group_over">
                            <input type="text" placeholder="请输入分组名" v-model="data.new_group_name">
                        </div>
                    </div>
                </scroll-view>
            </div>
            <!--详细-->
            <div class="detail">
                <scroll-view scroll-y>
                    <div class="item" v-for="(item,index) in data.render_data" :key="index">
                        <div class="img" :class="{off:item.isOff}">
                            <image
                                :src="'http://17xf.cq.cn:38000/' + item.img_address[0]"
                                mode="widthFix"></image>
                            <span class="describe">{{ item.isOff ? '已下架' : '售卖中' }}</span>
                        </div>
                        <div class="info">
                            <div class="title">{{ item.name }}</div>
                            <div class="edit">
                                <div class="price">
                                    <span>价格：</span>
                                    <!--{{ item.price }}-->
                                    <input
                                        v-model="item.price"
                                        maxlength="6"
                                        placeholder="请输入价格。" :disabled="!item.edit" :class="{edit:item.edit}"
                                        type="number">
                                </div>
                                <div class="inventory">
                                    <span>库存：</span>
                                    <!--{{ item.inventory }}-->
                                    <!--                  <input-->
                                    <!--                      v-model="item.inventory"-->
                                    <!--                      @input="nextTick(()=>item.inventory =parseInt(item.inventory) )"-->
                                    <!--                      placeholder="请输入库存。"-->
                                    <!--                      :disabled="!item.edit"-->
                                    <!--                      maxlength="4"-->
                                    <!--                      :class="{edit:item.edit}"-->
                                    <!--                      type="number">-->
                                    <span>无限制</span>
                                </div>
                            </div>
                            <div class="btn">
                                <el-button :type="item.isOff ? 'success':'info'" @click="change_off_state(item.id)">
                                    {{ item.isOff ? '上架' : '下架' }}
                                </el-button>
                                <!--                                <el-button :type="item.edit? 'primary':'warning'"-->
                                <!--                                           @click="edit_item(item.id,index,item)">-->
                                <!--                                    {{ item.edit ? '确认' : '小改' }}-->
                                <!--                                </el-button>-->
                                <el-button type="primary" @click="edit_goods(item.id)">修改</el-button>
                                <el-button type="danger" @click="remove_item(item.id,index)">删除</el-button>
                            </div>
                        </div>
                    </div>
                </scroll-view>
            </div>
            <!--更多-->
            <div class="more">
                <el-dropdown trigger="click">
                    <el-button type="primary">操作</el-button>
                    <template #dropdown>
                        <el-dropdown-item @click="add_goods">添加商品</el-dropdown-item>
                        <el-dropdown-item @click="remove_goods">删除分组</el-dropdown-item>
                    </template>
                </el-dropdown>
            </div>
        </div>

    </div>
</template>
<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
    name: '店铺管理',
})
</script>
<script setup lang="ts">
import {nextTick, reactive} from "vue";
// 引入发包
import {
    boss_get_goods,
    boss_add_group,
    boss_change_off_state,
    boss_update_goods_data,
    boss_delete_goods, boss_delete_group,
} from '@/server'
import {onLoad} from "@dcloudio/uni-app";

const data = reactive({
    // 当前保留数据
    current_data: {
        // 价格
        price: 0,
        // 库存
        inventory: 0,
    },

    // 新建分组
    el_new_group: undefined,

    // 对话框数据
    dialogue_data: {},
    // 分组选择
    select_index: 0,

    // 状态选择
    state_index: 0,

    // 渲染数据
    render_data: [],

    // 数据
    goods: [{
        "goods": [{
            "id": 110,
            "isOff": true,
            "name": "腊肉",
            "tags": ["一人份", "香辣", "鸭肉", "口味棒", "口味棒", "口味棒"],
            "price": 0.01,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 0,
            "month_sales": 12
        }, {
            "id": 11,
            "isOff": true,
            "name": "鲨鱼排骨",
            "tags": ["一人份", "香辣", "鸭肉", "口味棒", "口味棒", "口味棒"],
            "price": 0.03,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 111,
            "name": "狗肉",
            "tags": ["一人份", "香辣", "鸭肉", "口味棒", "口味棒", "口味棒"],
            "price": 0.02,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 1111,
            "name": "羊肉串",
            "tags": ["一人份", "香辣", "鸭肉", "口味棒", "口味棒", "口味棒"],
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }], "title": "肉"
    }, {
        "goods": [{
            "isOff": true,
            "id": 11111,
            "name": "娃哈哈",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 111111,
            "name": "asd",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "isOff": true,
            "id": 1111111,
            "name": "肌",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 11111111,
            "name": "abc",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 111111111,
            "name": "abc",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 1111111111,
            "name": "abc",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 1111111111111,
            "name": "abc",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 11111111111111,
            "name": "abc",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }, {
            "id": 111111111111111,
            "name": "abc",
            "price": 123.21,
            "img_address": "1_12312_islakdj.jpg",
            inventory: 11,
            "month_sales": 12
        }], "title": "水"
    }],

    // 新建分组名
    new_group_name: ""
})


// 新建分组
function add_group(e: {
    target: {
        parentNode: any;
    };
}) {
    console.log('添加分组')
    //   通过位移 改变位置。
    const el_new_group = e.target.parentNode
    data.el_new_group = el_new_group
    el_new_group.style.transform = 'translateX(-100%)'

    // 给input注入焦点
    const el_input = el_new_group.querySelector('input')
    setTimeout(() => el_input.focus(), 600)
}

// 新建分组确认
function add_group_over(e: {
    target: {
        value: string
    }
}) {

    data.dialogue_data = {
        title: '提示',
        content: `是否确认新增分组？分组名为：${data.new_group_name}`,
        confirm: async () => {
            // 请求服务器，增加一个分组。
            const re = await boss_add_group(data.new_group_name)
            if (!re?.code) return alert('增加失败！' + re.msg)
            // 根据返回内容更新。
            data.goods.push({
                goods: [],
                title: re.data.title
            })

            // 清空分组名。
            data.new_group_name = ''
            // 恢复状态
            const el_new_group = data.el_new_group as unknown as HTMLElement
            el_new_group.style.transform = 'translateX(0)'

            data.dialogue_data.visible = false
        },
        cancel: () => {
            data.dialogue_data.visible = false
        },
        visible: false,
    }

    //   获取input的内容
    const text_group_name = e.target.value
    // 有内容 让用户确定是否增加分组。
    if (text_group_name) return data.dialogue_data.visible = true

    // 没内容就弹回
    const el_new_group = data.el_new_group as unknown as HTMLElement
    el_new_group.style.transform = 'translateX(0)'
}

// 添加商品
function add_goods() {
    console.log('添加商品')
    // 跳转到编辑商品
    uni.navigateTo({url: '/pages/boss/edit_goods?group_id=' + data.select_index})
}

// 删除分组
async function remove_goods() {
    console.log('删除分组')
    // 弹出对话框
    data.dialogue_data = {
        title: '警告',
        content: `这是一项不可逆的操作，按下 [确定] 会直接删除 <${data.goods[data.select_index].title}> 分组!!!`,
        confirm: async () => {
            // 发起请求删除分组
            const result_ = await boss_delete_group(data.select_index)
            // 删除成功
            if (result_?.code) {
                // 删除分组
                data.goods.splice(data.select_index, 1)
                // 如果data.select_index是最后一个，那就选择前一个
                if (data.select_index === data.goods.length) --data.select_index
                //   刷新
                change_nav(data.select_index)
            }
            data.dialogue_data.visible = false
        },
        cancel: () => {
            data.dialogue_data.visible = false
        },
        visible: false,
    }
    data.dialogue_data.visible = true

}

function change_nav(index: number) {
    data.select_index = index
    //  更新渲染数据
    select_state(data.state_index)
}


// 选择状态
function select_state(state_index: number) {
//     在此之前，我们需要取消用户修改商品数据
    const edit_index = data.render_data.findIndex(item => item.edit === true)
    // 有修改。
    if (edit_index !== -1) {
        // 恢复原始数据
        data.render_data[edit_index].edit = false
        data.render_data[edit_index].price = data.current_data.price
        data.render_data[edit_index].inventory = data.current_data.inventory
    }
// 切换状态
    data.state_index = state_index
    switch (state_index) {
        case 0:
            // 不分类
            data.render_data = data.goods[data.select_index].goods
            break
        case 1:
            // 售卖中
            data.render_data = data.goods[data.select_index].goods.filter(item => !item.isOff && item.inventory > 0)
            console.log('=====')
            console.log(data.goods[data.select_index].goods)
            console.log(data.render_data)
            console.log('=====')
            break
        case 2:
            // 已下架
            data.render_data = data.goods[data.select_index].goods.filter((item, index) => item.isOff)
            break
        case 3:
            // 已售空
            data.render_data = data.goods[data.select_index].goods.filter(item => !(item.inventory > 0))
            break
    }
}

// 切换上下架
async function change_off_state(id: number) {
    console.log('切换上下架', id)
    const re = await boss_change_off_state(data.select_index, id)

    if (!re.code) return console.log(re.msg)
    // 找到对应的商品
    const index = data.goods[data.select_index].goods.findIndex(item => item.id === id)

    if (index === -1) return console.log('坑！重获取数据！')

    //  更新数据
    data.goods[data.select_index].goods[index].isOff = re.data.isOff


//     更新渲染数据的isOff
    select_state(data.state_index)
//   const render_index = data.render_data.findIndex(item => item.id === id)
//   if (render_index == -1) return console.log('坑！ 更新渲染数据失败')
//   data.render_data[render_index].isOff = re.data.isOff
}

async function edit_item(id: number, render_index: number, item: any) {
    // 进入编辑状态
    if (!item.edit) {
        // 保留当前数据
        data.current_data = {
            price: item.price,
            inventory: item.inventory
        }

        //  开启编辑模式
        item.edit = true

    } else {
        item.edit = false
        //     校对数据是否变更
        if (data.current_data.price !== item.price || data.current_data.inventory !== item.inventory) {
            //     发起请求
            {
                item.price = Number(Number(item.price).toFixed(2))
            }
            const result_ = await boss_update_goods_data(data.select_index, id, {
                price: item.price,
                inventory: item.inventory
            })
            console.log({
                price: item.price,
                inventory: item.inventory
            })

            if (result_?.code) return console.log('ok')

            // 更新失败了，还原数据
            console.log(result_.msg)
            item.price = data.current_data.price
            item.inventory = data.current_data.inventory
        }

    }
}

// 编辑物品
function edit_goods(id: number) {
    console.log('编辑物品', id)
    // 跳转到编辑商品
    uni.navigateTo({url: '/pages/boss/edit_goods?group_id=' + data.select_index + '&goods_id=' + id})
}

async function remove_item(id: number, render_index: number) {
    // 确认删除
    data.dialogue_data = {
        title: '警告',
        content: `这是一项不可逆的操作，按下 [确定] 会直接删除该商品!!!`,
        confirm: async () => {

            const result_delete_goods = await boss_delete_goods(data.select_index, id)
            if (!result_delete_goods?.code) return console.log(result_delete_goods.msg)
            //  删除成功
            //  删除渲染数据
            data.render_data.splice(render_index, 1)
            //  删除原始数据
            const index = data.goods[data.select_index].goods.findIndex(item => item.id === id)
            if (index !== -1) data.goods[data.select_index].goods.splice(index, 1)

            data.dialogue_data.visible = false
        },
        cancel: () => {
            data.dialogue_data.visible = false
        },
        visible: false,
    }

    data.dialogue_data.visible = true

}

// 获取商品数据
uni.$on('refresh_data', () => {
    // 获取商品数据
    boss_get_goods().then((goods_data) => {
        data.goods = []
        if (goods_data.code) {
            data.goods = goods_data.data.goods
            select_state(data.state_index)
        }
    })
})

onLoad(() => {
    uni.$emit('refresh_data')
})
</script>

<style scoped lang="scss">
$top_height: 80rpx;

.operate {
    height: $top_height;

    color: rgb(165, 165, 169);

    .container {
        display: flex;
        white-space: nowrap;

        .select {
            color: black
        }

        .item {
            box-sizing: border-box;
            padding: 5px;
        }
    }


}

.content {
    position: relative;
    font-size: 40rpx;
    display: flex;

    scroll-view {
        height: calc(100vh - $top_height);
        //display: none;
    }

    .group {
        display: flex;
        flex-direction: column;
        flex: 3;

        .item {

            //margin-left: 3px;
            box-sizing: border-box;
            padding: 10px 5px;
            background-color: white;
        }

        .select {
            border-left: 4px solid rgb(77, 78, 91);
            background-color: whitesmoke;
        }

        //  新建分组
        .new_group {
            transition: all 0.5s;
            position: relative;
            //  文字
            .text {
            }

            //  输入框
            .input {

                position: absolute;
                top: 0;
                left: 100%;
                width: 100%;
            }
        }
    }

    .detail {
        flex: 7;
        //height: 350px;
        background-color: floralwhite;

        .item {
            margin: 5px 0;
            display: flex;
            flex-direction: row;

            .img.off {
                filter: grayscale(100%);
            }

            .img {
                transition: all 0.5s;
                //background-color: red;
                flex: 3;
                position: relative;
                overflow: hidden;

                image {
                    width: 100%;

                    position: absolute;

                    //  居中
                    //position: relative;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .describe {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    text-align: center;
                    width: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    color: white;
                    font-size: 30rpx;
                    box-sizing: border-box;
                    //padding: 2px 1px;
                }
            }

            .info {
                flex: 7;
                //background-color: rgb(165, 165, 169);;
                //background-color: greenyellow;
                display: flex;
                flex-direction: column;

                .title {

                    color: rgb(64, 62, 88);
                    font-weight: bold;
                }

                .edit {
                    //display: flex;
                    padding: 5px 0;

                    span {
                        white-space: nowrap;
                    }

                    input {
                        margin-right: 2px;
                        //border: 1px solid greenyellow;
                    }

                    input.edit {
                        border: 1px solid black;
                    }

                    .price {
                        display: flex;
                        align-items: center;

                    }

                    .inventory {
                        align-items: center;
                        display: flex;
                    }
                }

                .btn {
                    display: flex;
                    //flex-wrap: wrap;
                    justify-content: space-around;
                    padding-bottom: 5px;
                }

            }
        }
    }

    .more {
        position: absolute;
        bottom: 0;
        right: 0;
    }

}
</style>
