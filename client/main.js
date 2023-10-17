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


uni.$httpRequest = function (options) {
    uni.$showMsg('请求数据中……')
    //  发起请求那就提示弹框
    return new Promise((resolve, reject) => {
        //
        if (!options.noBaseUrl) options.url = configs.serverAddress + options.url
        uni.request({
            ...options,
            // url: configs.serverAddress + options.url,
            // method: options.method,
            // data: options.data,
            // header: options.header,
            success: (e) => {
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
