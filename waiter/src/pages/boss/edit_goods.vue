<template>
    <div class="container_edit_goods">
        <h4>{{ data.modeTitle }}</h4>
        <el-form ref="ref_form"
                 :rules="form_rules"
                 label-width="100px"
                 label-position="left"
                 :inline="true"
                 :model="form"
        >
            <!--商品名-->
            <el-form-item label="商品名：" prop="name">
                <el-row :span="24">
                    <el-input v-model="form.name"></el-input>
                </el-row>
            </el-form-item>
            <!--选择分类-->

            <el-form-item label="选择分组：" prop="group">
                <el-row>
                    <el-col :span="24">
                        <el-select v-model="form.group" placeholder="请选择分类">
                            <el-option v-for="(item,index) in data.goods" :label="item.title" :value="index"/>
                        </el-select>
                    </el-col>
                    <el-col :span="12">
                        <!--            <el-button style="margin-left: 5px" @click="new_group">新建分组</el-button>-->
                    </el-col>
                </el-row>
            </el-form-item>
            <el-form-item label="商品图片：" prop="imgs">
                <div class="shops" ref="ref_shops">
                    <el-upload
                        :limit="4"
                        :file-list="form.imgs"
                        list-type="picture-card"
                        style="max-width: 500rpx"
                        :auto-upload="false"
                        accept="image/*"
                        :on-preview="preview_img"
                        :on-change="(file, fileList) => changeImg_v2(file, fileList)"
                        :on-remove="(file,fileList)=>removeImg_v2(file,fileList)"
                        :show-file-list="true"
                    >


                        <!--                            <image-->
                        <!--                                style="height: 200rpx"-->
                        <!--                                mode="heightFix"-->
                        <!--                                v-if="item.url"-->

                        <!--                                :src="item.url"-->
                        <!--                            />-->
                        <!--                        <div class="add" v-if="!item.url">-->
                        <!--                            <div class="h"></div>-->
                        <!--                            <div class="s"></div>-->
                        <!--                        </div>-->
                    </el-upload>

                    <el-dialog v-model="data.show_goods_preview" fullscreen
                               style="display:flex;
                               align-items:center;
                               justify-content: center;
                               background-color: rgba(0,0,0,0.5);">
                        <image :src="data.preview_url"></image>
                    </el-dialog>

                </div>
                <div class="tips">提示：默认会把第一张作为物品头像其余作为展示图，最多只能上传四张图，</div>
            </el-form-item>
            <!--商品标签-->
            <el-form-item label="商品标签：">
                <el-row>
                    <el-col :span="12">
                        <el-input v-model="form.tag"></el-input>
                    </el-col>
                    <el-col :span="12">
                        <el-button style="margin-left: 5px" @click="add_tag">添加</el-button>
                    </el-col>
                </el-row>
                <el-row>
                    <div class="tags">
                        <div class="tag_item">
                            <el-tag style="margin-left: 3px" type="warning" size="large"
                                    v-for="(tag,index) in form.tags"
                                    :key="index"
                                    closable
                                    @close="form.tags.splice(index,1)">
                                {{ tag }}
                            </el-tag>
                        </div>
                    </div>
                </el-row>
            </el-form-item>
            <!--价格-->
            <el-form-item label="商品价格：" prop="price">
                <el-row>
                    <el-col :span="12">
                        <el-input type="number" v-model="form.price"
                                  @change="form.price = Number(Number(form.price).toFixed(2))"></el-input>
                    </el-col>
                    <el-col :span="12">
                        <div>元</div>
                    </el-col>
                </el-row>
            </el-form-item>

            <!--库存-->
            <el-form-item label="商品库存：" prop="inventory">
                <el-row>
                    <el-col :span="12">
                        <el-input type="number" v-model.number="form.inventory"
                                  :disabled="form.not_inventory"
                                  @change="form.inventory = Number(Number(form.price).toFixed(0))"></el-input>
                    </el-col>
                    <el-col :span="12">
                        <el-checkbox v-model="form.not_inventory" style="margin-left: 5px" label="无限制" size="large"/>
                    </el-col>
                </el-row>
            </el-form-item>
            <!--提交-->
            <el-form-item>
                <el-button size="large" type="primary" @click="onSubmit(ref_form)">
                    {{ data.modeTitle === mode.edit ? '更新数据' : '提交数据' }}
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>


<script lang="ts">
import {defineComponent} from "vue";

defineComponent({
    name: '编辑物品'
})
</script>

<script lang="ts" setup>
//  引入server
import {boss_add_goods, boss_get_goods} from '@/server'
import {reactive, ref} from 'vue'
import type {FormInstance, FormRules, UploadFile, UploadFiles} from "element-plus";
import {onLoad} from "@dcloudio/uni-app";

// 定义枚举
enum mode {
    add = '新增商品',
    edit = '修改商品'
}

const data: data = reactive({
    // 页面参数
    urlParams: {},
    // 模式标题
    modeTitle: "未知模式",
    // 商品数据
    goods: [],
    // 编辑模式下的商品数据
    edit_mode_goods: {},
//     图片预览
    show_goods_preview: false,
//     预览地址
    preview_url: '',
});

// 数据类型
interface data {
    goods: any[]
    urlParams: any
    modeTitle: string
    edit_mode_goods: any
    show_goods_preview: boolean
    preview_url: string
}

// 校验
const form_rules = reactive<FormRules>({
    name: [{
        required: true, message: '必须填写商品名称', trigger: 'blur',
    }, {
        min: 1, max: 10, message: '长度必须保持为1-10个字符', trigger: 'change'
    }],
    imgs: [
        {
            required: true, message: "至少上传一张图片", trigger: "blur"
        },
        {
            type: "array",
            validator: (rule, value, next) => {
                // 至少要有一项存在url
                value.some((item: any) => item.url) ? next() : next('请至少上传一张图片！')
            },
            trigger: "blur"
        }
    ],
    group: [{
        required: true,
        message: '请选择商品分类',
        trigger: 'change'
    }],
    price: [{
        required: true,
        message: '必须填写',
        trigger: 'blur'
    }, {
        validator: (rule: any, value: any, next: any) => {
            // 验证大小
            if (value === '') {
                next(('请填写价格。'))
            } else {
                value > 0.1 && value < 99999 ? next() : next('价格必须是0.1元~99999元范围内。')
            }
        }, trigger: 'change'
    }],
    inventory: [{
        validator: (rule: any, value: any, next: any) => {
            // 忽略库存
            if (form.not_inventory) return next()
            // 验证大小
            if (value === '') {
                next(('请填写库存。'))
            } else {
                value > 0 && value < 99999 ? next() : next('库存必须是1~99999范围内。')
            }
        },
        trigger: 'change'
    }
    ]
})

// 表规则
interface form {
    urlParams: {
        group_id: number,
        goods_id: number
    },
    is_edit_mode: boolean,
    edit_goods_index: number,
    name: string,
    price: number | null,
    inventory: number | null,
    imgs: {
        // file_list: any[]; // 这里可以根据实际情况调整类型
        url: string;
        name: string;
        not_add_index?: number;
    }[],
    imgs_params: any,
    not_inventory: boolean,
    group: number | null,
    tag: string,
    tags: string[],
}


// 表数据
const form = reactive<form>({
    urlParams: {},
    // 是否是编辑模式
    is_edit_mode: false,
    edit_goods_index: -1,
    name: '',
    price: null,
    inventory: null,
    imgs: [],
    imgs_params: {
        remove_indexs: [],
    },
    not_inventory: true,
    group: null,
    tag: "",
    tags: [],
});

(async function () {
// 获取商品数据
    const r = await boss_get_goods()
    if (!r.code) return console.log(r.msg)

    data.goods = r.data.goods

    //  获取下标
    if (data.modeTitle === mode.edit) {
        const index = data.goods[data.urlParams.group_id].goods.findIndex((item: any) => item.id == data.urlParams.goods_id)
        if (index === -1) return console.log('未找到该商品')
        //  赋值
        data.edit_mode_goods = data.goods[data.urlParams.group_id].goods[index]

        //  赋值
        form.is_edit_mode = true
        form.edit_goods_index = index

        form.name = data.edit_mode_goods.name
        form.price = data.edit_mode_goods.price
        form.inventory = data.edit_mode_goods.inventory
        form.not_inventory = data.edit_mode_goods.not_inventory
        form.group = Number(data.urlParams.group_id)
        form.tags = data.edit_mode_goods.tags
        console.log('==================')
        console.log(data.edit_mode_goods)
        console.log('==================')
        console.log(',', data.edit_mode_goods.img_address)
        form.imgs = data.edit_mode_goods.img_address.map((address: string, index: number) => ({
            // file_list: [],
            url: 'http://17xf.cq.cn:38000/' + address,
            name: address ?? Math.random() * 100 + ''.split('/').reverse()[0],
            not_add_index: index
        }));

        console.log(form)
    }

})()

// 新建分组
function new_group() {
}

// 修改图片
function changeImg(uploadFile: UploadFile, uploadFiles: UploadFiles, index: number) {
    console.log('=================')
    console.log(uploadFile, uploadFiles)
    console.log('=================')
    // 创建新的图片映射
    const file = uploadFile.raw

    // 判定大小
    if (file!.size / 1024 / 1024 > 2) {
        // 清理掉最后一项
        uploadFiles.splice(uploadFiles.length - 1, 1)
        return uni.showToast({title: "请不要传入超过5MB大小的图片！"})
    }


    // 如果有冗余
    const ry = uploadFiles.length > 1
    if (ry) {
        // 删掉之前的映射
        URL.revokeObjectURL(form.imgs[index].url)
        // 就删掉之前的冗余
        uploadFiles.splice(0, uploadFiles.length - 1)
    }

    form.imgs[index].url = URL.createObjectURL(file!)

    // 变更数据
    form.imgs[index].file_list = uploadFiles
    form.imgs[index].name = uploadFile.name

    // 判断 imgs数量 如果小于4 那就增加一个位置
    if (form.imgs.length < 4 && !(ry)) {
        form.imgs.push({url: '', file_list: []})
    }
    console.log('console.log(form.imgs)')
    console.log(form.imgs)
    console.log('console.log(form.imgs)')
}

// 移出图片
function removeImg(uploadFile: UploadFile, uploadFiles: UploadFiles, index: number) {
    // 释放映射
    URL.revokeObjectURL(form.imgs[index].url)
    // 长度
    const len = form.imgs.length
    // 删掉中间那个
    form.imgs.splice(index, 1)
    // 如果有4个 并且没有空的
    if (len === 4 && !form.imgs.some(item => !item.url)) {
        form.imgs.push({url: '', file_list: []})
    }
}

function preview_img(file: UploadFile) {
    data.show_goods_preview = true
    data.preview_url = file.url!
}

function changeImg_v2(file: UploadFile, fileList: any) {

    console.log(fileList)
    // 判定上传的file 必须是图片类，并且大小不超过5mb
    if (file.raw!.type.indexOf('image') === -1) {
        fileList.splice(fileList.length - 1, 1)
        return uni.showToast({title: "只能上传图片类型", icon: "error"})
    }

    if (file.raw!.size / 1024 / 1024 > 5) {
        fileList.splice(fileList.length - 1, 1)
        return uni.showToast({title: "请不要传入超过5MB大小的图片！", icon: "error"})
    }
    form.imgs = fileList
}

function removeImg_v2(file: UploadFile, fileList: any) {
    // 原数据，在移交图片参数新增。
    if (file.not_add_index !== undefined) {
        form.imgs_params.remove_indexs.push(file.not_add_index)
    }
    form.imgs = fileList
}

//  添加标签
function add_tag() {
//   非空
    if (!form.tag) return uni.showToast({title: "标签不能为空", icon: "error"})
    //  字符长度超过
    if (form.tag.length > 6) return uni.showToast({title: "字符长度不可大于6个字符", icon: "error"})
    // 最多只能添加6个标签
    if (form.tags.length > 6) return uni.showToast({title: "最多只能添加6个标签！", icon: "error"})
    // 重复
    if (form.tags.indexOf(form.tag) !== -1) return uni.showToast({title: "标签重复", icon: "error"})
    form.tags.push(form.tag)
    form.tag = ''

}

const ref_shops = ref()
const ref_form = ref()


// 提交数据
const onSubmit = async (formEl: FormInstance) => {

    // 表单验证
    const verify = await formEl.validate(isValid => isValid)

    if (!verify) return uni.showToast({
        title: "表单数据未完善，请填写完！",
        icon: "error"
    })

    //   提交表单
    const copy_form: any = {...form}


    // 增加一个属性
    const formdata = new FormData()

    // 遍历imgs 只允许本次更新出来的，也就是 不包含not_add_index的数据
    copy_form.imgs.forEach((item: any, index: number) => {
        if (item.not_add_index !== undefined) return
        formdata.append(`image_${index}`, item.raw)
    })

    //  剔除无用的属性
    delete copy_form.imgs
    delete copy_form.tag


    formdata.append('params', JSON.stringify(copy_form))

    const r = await boss_add_goods(formdata)
    if (r.code) {
        uni.showToast({
            title: "操作成功",
            icon: "success"
        })
        // return uni.navigateBack({
        //   delta: 1
        // })

        return uni.navigateBack({
            delta: 1, // 返回的页面数，1表示返回上一个页面
            success: function () {
                // 返回成功后的操作
                uni.$emit('refresh_data')
            }
        });

    }
    uni.showToast({
        title: r.msg,
        icon: "error"
    })
}


onLoad((urlParams: any) => {

    const {group_id, goods_id} = urlParams
    if (group_id !== undefined) {

        form.group = Number(group_id)

        form.urlParams = {
            group_id: Number(group_id),
            goods_id: Number(goods_id)
        }
        data.urlParams = form.urlParams


    }

    data.modeTitle = goods_id ? mode.edit : mode.add

})
</script>


<style scoped lang="scss">
.container_edit_goods {
    padding: 20rpx;
}

.add {
    background-color: rgb(246, 246, 246);
    width: 200rpx;
    height: 200rpx;
    position: relative;
}

.add::before, .add::after {
    content: '';
    display: block;
    width: 60%;
    height: 5%;
    background-color: rgb(173, 173, 173);
    //居中
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.add::after {
    transform: translate(-50%, -50%) rotate(90deg);
}
</style>
