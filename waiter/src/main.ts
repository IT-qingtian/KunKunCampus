import {createSSRApp} from 'vue';
import App from "./App.vue";
import * as Pinia from 'pinia';
import './style.css'
import {ElMessage} from 'element-plus';


const provde_ = [
    ['el_message', ElMessage]
]

export function createApp() {
    const app = createSSRApp(App);
    app.use(Pinia.createPinia());
    app.use(ElMessage)
    app.config.globalProperties.message = ElMessage
    // provide属性
    // 遍历 注册provide_
    provde_.forEach((item) => {
        app.provide(<string>item[0], item[1])
    })
    return {
        app,
        Pinia, // 此处必须将 Pinia 返回
    };
}
