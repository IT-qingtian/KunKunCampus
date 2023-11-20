import Vue from 'vue'
import App from './App'
import store from '@/store/store.js'
//  引入配置项。
import configs from '@/configs/configs.js'


import uView from "uview-ui";


Vue.use(uView);


// 封装弹框的方法
uni.$showMsg = function (title = '数据请求失败！', duration = 2000) {
    uni.showToast({
        title,
        duration,
        icon: 'none'
    })
}

// 前往登陆
uni.$gotoLogin = function () {
    uni.switchTab({
        url: "/pages/my/index",
        success: () => {
            // setTimeout(() => {
            uni.$showMsg("您还没有登录或登录已失效，请先登录后再访问吧！")
            // }, 3000)
        },
    });
}


uni.$httpRequest = function (options) {
    uni.$showMsg('请求数据中……')
    //  发起请求那就提示弹框
    return new Promise((resolve, reject) => {

        if (!options.noBaseUrl) options.url = configs.serverAddress + options.url

        uni.request({
            ...options,
            // url: configs.serverAddress + options.url,
            // method: options.method,
            // data: options.data,
            // header: options.header,
            success: (e) => {
                if (!e.data) {
                    //     没数据返回
                    console.log('链接服务器失败！')
                    e.data = {
                        code: 0,
                        msg: "无数据返回"
                    }
                }
                const {code, msg} = e.data//内部内容

                if (code === 0 && msg === '身份码无效！') {// 当code为 0 并且msg为身份码无效！ 那就说明没有登录
                    store.state.store_user.token = ''// 清理掉token

                    //     跳转到登陆页面
                    setTimeout(() => {
                        uni.$gotoLogin()
                    }, 200)
                }
                uni.hideToast()
                resolve(e)
            },
            fail: reject
        })
    })
}


Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App,
    store
})
app.$mount()
