<template>
    <scroll-view scroll-y style="height: 100vh">
        <el-form
            ref="ref_form"
            :rules="form_rules"
            label-position="top"
            :model="form"
            style="max-width: 460px;padding: 10px"
        >
            <el-form-item prop="title" label="店铺名">
                <el-input v-model="form.title" style="width: 350rpx;"/>
            </el-form-item>
            <el-divider/>
            <el-form-item label="营业时间段（自动更改营业状态）">
                <div style="display: flex">
                    <el-time-select
                        v-model="form.start_time"
                        start="06:00"
                        step="00:30"
                        end="22:30"
                        placeholder="选择营业时间"
                    />
                    <span>&nbsp;-&nbsp;</span>
                    <el-time-select
                        v-model="form.end_time"
                        :start="form.start_time"
                        step="00:30"
                        end="23:00"
                        placeholder="选择打烊时间"
                    />
                </div>
                <div>
                    <el-checkbox v-model="form.trade_time[1]" size="large" label="周一"></el-checkbox>
                    <el-checkbox v-model="form.trade_time[2]" size="large" label="周二"></el-checkbox>
                    <el-checkbox v-model="form.trade_time[3]" size="large" label="周三"></el-checkbox>
                    <el-checkbox v-model="form.trade_time[4]" size="large" label="周四"></el-checkbox>
                    <el-checkbox v-model="form.trade_time[5]" size="large" label="周五"></el-checkbox>
                    <el-checkbox v-model="form.trade_time[6]" size="large" label="周六"></el-checkbox>
                    <el-checkbox v-model="form.trade_time[0]" size="large" label="周日"></el-checkbox>
                </div>
            </el-form-item>
            <el-divider/>
            <el-form-item label="店铺激活">
                <div style="display: flex;flex-direction: column">
                    <el-switch
                        v-model="form.active"
                        size="large"
                        inline-prompt
                        active-text="店铺已激活"
                        inactive-text="店铺已停运"
                        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                    />
                </div>
            </el-form-item>
            <el-divider/>
            <el-form-item prop="mdp" label="外卖起送价格">
                <div>
                    <el-input v-model="form.mdp" @change="change_price" style="width: 120rpx;margin-right: 5px"/>
                    <span>元</span>
                </div>
            </el-form-item>
            <el-divider/>
            <el-form-item label="店铺标签（客户更容易通过关键词搜索到店铺）">
                <el-row>
                    <el-col :span="12">
                        <el-input v-model="form.tag" style="width: 120rpx;"></el-input>
                    </el-col>
                    <el-col :span="12">
                        <el-button style="margin-left: 5px" @click="addTag">添加</el-button>
                    </el-col>
                </el-row>
            </el-form-item>
            <div>
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
            </div>
            <el-divider/>
            <el-form-item prop="type" label="店铺类型">

                <el-select v-model="form.type">
                    <el-option
                        v-for="(item,index) in shop_type"
                        :label="item"
                        :value="index+1"
                        :key="index"
                    ></el-option>
                </el-select>

            </el-form-item>
            <el-divider/>
            <el-form-item prop="imgs" label="照片（最多四张，默认第一张作为头像）">

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
                    </el-upload>

                    <el-dialog v-model="data.show_goods_preview" fullscreen
                               style="display:flex;
                     z-index: 99;
                               align-items:center;
                               justify-content: center;
                               background-color: rgba(0,0,0,0.5);">
                        <image :src="data.preview_url"></image>
                    </el-dialog>

                </div>

            </el-form-item>
            <el-form-item prop="phone_number" label="联系电话（客户更容易联系您）">
                <el-input v-model="form.phone_number" maxlength="11" style="width: 350rpx;"/>
            </el-form-item>
            <el-divider/>
            <el-form-item prop="address" label="店铺位置（货物自提地址）">
                <el-input v-model="form.address" maxlength="20" show-word-limit/>
            </el-form-item>
            <el-divider/>
            <el-form-item label="店铺公告">
                <el-input v-model="form.notice" maxlength="50" type="textarea" show-word-limit rows="5"></el-input>
            </el-form-item>
            <el-divider/>
            <el-button type="primary" @click="update(ref_form)">更新</el-button>
        </el-form>
    </scroll-view>
</template>

<script lang="ts" setup>
import {reactive, ref} from 'vue'
import {onLoad} from "@dcloudio/uni-app";
import {boss_get_shop_info, boss_update_shop_data} from "@/server";
import type {FormInstance, FormRules, UploadFile, UploadFiles} from "element-plus";

const ref_form = ref()
let form = reactive({
    active: true,
    tag: '',
    // 预留
    imgs: [],
    // 保留图
    reserve_imgs: [],
    trade_time: [false, false, false, false, false, false, false],
})

// 校验
const form_rules = reactive<FormRules>({
    title: [{
        required: true, message: '必须填写店铺名称', trigger: 'blur',
    }, {
        min: 2, max: 10, message: '长度必须保持为2-10个字符', trigger: 'change'
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
    type: [{
        required: true,
        message: '请选择店铺分类',
        trigger: 'change'
    }],
    mdp: [{
        required: true,
        message: '必须填写起送价格',
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
    phone_number: [{
        required: true,
        message: "请留下您的电话，方便客户联系您。",
        trigger: 'change'
    }
    ],
    address: [{
        required: true,
        message: "请留下您的地址，方便客户联系您。",
        trigger: 'change'
    }
    ]
})

const shop_type = ['周边', '超市', '自营']
const data = {
    show_goods_preview: false,
    preview_url: '',
}

//  自动修正价格
function change_price() {
    form.mdp = Number(form.mdp).toFixed(2)
}


function preview_img(file: UploadFile) {
    data.show_goods_preview = true
    data.preview_url = file.url!
}

function changeImg_v2(file: UploadFile, fileList: any) {
    // 判定上传的file 必须是图片类，并且大小不超过5mb
    if (file.raw!.type.indexOf('image') === -1) {
        fileList.splice(fileList.length - 1, 1)
        return uni.showToast({title: "只能上传图片类型", icon: "error"})
    }

    if (file.raw!.size / 1024 / 1024 > 8) {
        fileList.splice(fileList.length - 1, 1)
        return uni.showToast({title: "请不要传入超过8MB大小的图片！", icon: "error"})
    }
    form.imgs = fileList
}

function removeImg_v2(file: UploadFile, fileList: any) {
    form.imgs = fileList
}


// 增加标签
function addTag() {
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

// 获取店铺信息
async function getShopInfo() {
    const shop_info = await boss_get_shop_info()
    if (!shop_info.code) return uni.showToast({
        title: "获取店铺信息失败！",
        icon: "error"
    })
    form = Object.assign(form, shop_info.data)
    form.active = !!form.active
    form.imgs = form.img_address.map((address: string, index: number) => ({
        url: 'http://17xf.cq.cn:38000/' + address,
        name: address ?? Math.random() * 100 + ''.split('/').reverse()[0]
    }));
}

/*更新信息*/
async function update(ref_form: FormInstance) {

    // 表单验证
    const verify = await ref_form.validate(isValid => isValid)
    if (!verify) return uni.showToast({
        title: "表单数据未完善，请填写完！",
        icon: "error"
    })
    // 锁定信息
    const fd = new FormData()
    const f = {...form}


    form.imgs.forEach((item: any, index: number) => {
        // 判定是否有raw对象 如果没有那就是保留图
        item.raw ? fd.append(`image_${index}`, item.raw) : f.reserve_imgs.push(item.name)
    })

    // 删除不必要信息
    delete f.tag
    delete f.imgs
    delete f.img_address


    fd.append('params', JSON.stringify(f))
    const r_update = await boss_update_shop_data(fd)
    if (!r_update.code) {
        uni.showToast({
            title: r_update.msg,
            icon: "error"
        })
    } else {
        uni.showToast({
            title: "店铺信息更新成功！",
            icon: "success"
        })
        await getShopInfo()
    }
}

// 获取店铺信息
onLoad(async () => {
    await getShopInfo()
})

</script>
<style lang="scss">

</style>
