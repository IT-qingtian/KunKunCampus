// 引入axios
import axios from 'axios';
import { ElLoading } from 'element-plus';
// 引入store
import { user } from '@/store';
const store_user = user();
let loading_;
const loading = (isOpen) => {
    if (isOpen) {
        // 不存在loading_
        // if (!loading_) {
        // loading_ = ElLoading.service({
        //     lock: true,
        //     text: '数据请求中',
        //     background: 'rgba(0, 0, 0, 0.7)',
        // })
        loading_ = ElLoading.service({
            lock: true,
            text: '数据中请求……',
            background: 'rgba(0, 0, 0, 0.7)',
            // fullscreen: true
        });
        // }
    }
    else {
        // 先关闭，然后再卸掉
        setTimeout(() => loading_.close(), 100);
        // loading_.close()
    }
};
// 创建axios
const ax = axios.create({
    baseURL: 'http://10.14.2.37:38000',
});
// 请求拦截器
ax.interceptors.request.use((req) => {
    // 加载
    // const loadingInstance1 = ElLoading.service({fullscreen: true})
    loading(true);
    // 根据url来选择使用哪个 身份码，如果url是以/run开头就用run码
    const authorization = req.url.startsWith('/run') ? store_user.authorization_run : store_user.authorization;
    req.headers.Authorization = `Bearer ${authorization}`;
    return req;
}, (error) => {
    Promise.reject(error);
});
// 拦截返回数据
ax.interceptors.response.use((data) => {
    loading();
    return data.data;
}, err => {
    if (err.code === "ERR_NETWORK")
        uni.showToast({ title: '网络错误,无法连接上服务器！', icon: 'none' });
});
// 登陆
const boss_login = (code) => ax.post('/boss/login', { code });
const run_login = (code) => ax.post('/run/login', { code });
/*
拉取订单
* @param out_trade_no 订单号 不传入就拉取全部订单。
 */
const boss_pull_order = (out_trade_no, is_to_day) => ax.post('/boss/pull_order', {
    out_trade_no,
    is_to_day
});
/*
商户接单
* @param out_trade_no 订单号
* @param is_merchant_dispatch 是否商户自行派送
 */
const boss_receving_order = (out_trade_no, is_merchant_dispatch) => ax.post('/boss/supermarket/receving_order', {
    out_trade_no,
    is_merchant_dispatch
});
/*
商户派送订单 （也可以用于 处理完 订单）
* @param out_trade_no 订单号
 */
const boss_dispatch_order = (out_trade_no) => ax.post('/boss/supermarket/dispatch_order', { out_trade_no });
/*
商户确认配送到达订单
* @param out_trade_no 订单号
 */
const boss_over_order = (out_trade_no) => ax.post('/boss/supermarket/over_order', { out_trade_no });
/*
商户添加商品
 */
const boss_add_goods = (data) => ax.post('/boss/supermarket/add_goods', data);
/*
商户获取商品
 */
const boss_get_goods = () => ax.post('/boss/manage/get_goods');
/*  商户请求增加分组 */
const boss_add_group = (title) => ax.post('/boss/manage/add_group', { title });
/*  切换上下架  */
const boss_change_off_state = (group_id, goods_id) => ax.post('/boss/manage/change_off_state', {
    group_id,
    goods_id
});
/* 变更商品数据 */
const boss_update_goods_data = (group_id, goods_id, data) => ax.post('/boss/manage/update_goods_data', {
    group_id,
    goods_id,
    data
});
/* 删除商品 */
const boss_delete_goods = (group_id, goods_id) => ax.post('/boss/manage/delete_goods', {
    group_id,
    goods_id
});
/* 删除分组 */
const boss_delete_group = (group_id) => ax.post('/boss/manage/delete_group', { group_id });
/* 商户获取店铺信息 */
const boss_get_shop_info = () => ax.post('/boss/shopInfo');
/* 商户更新店铺信息 */
const boss_update_shop_data = (FromData) => ax.post('/boss/shop/update_shop_data', FromData);
/*获取身份信息*/
const run_get_user_info = () => ax.post('/run/get_user_info');
/*修改状态*/
const run_change_work_status = (is_work_ing) => ax.post('/run/change_work_status', { is_work_ing });
/*获取订单*/
const run_get_orders = (out_trade_no, is_my) => ax.post('/run/get_orders', {
    out_trade_no,
    is_my
});
const run_receving_order = (out_trade_no) => ax.post('/run/supermarket/receving', { out_trade_no });
/*更新订单状态*/
const run_update_order_state = (out_trade_no) => ax.post('/run/supermarket/change_delivery_state', { out_trade_no });
/*快递_抢单*/
const run_kd_grabbing = (out_trade_no) => ax.post('/run/kd/grabbing', { out_trade_no });
/*  快递 修改快递状态*/
const run_update_order_state_kd = (out_trade_no) => ax.post('/run/kd/update_state', { out_trade_no });
// 获取费用
const get_service_fee = () => ax.post('/get_service_fee');
// 获取身份码
const get_invitation_code = (code) => ax.post('/get_invitation_code', { code });
const init = async () => {
    //     获取 各种费用
    const r_fee = await get_service_fee();
    if (!r_fee.code)
        return console.log('获取费用失败！');
    store_user.setServiceFee(r_fee.data);
    console.log('r_fee.data', r_fee.data);
};
init();
// 导出
export { boss_login, run_login, boss_pull_order, boss_receving_order, boss_dispatch_order, boss_over_order, boss_add_goods, boss_get_goods, boss_add_group, boss_change_off_state, boss_update_goods_data, boss_delete_goods, boss_delete_group, boss_get_shop_info, boss_update_shop_data, run_get_user_info, run_change_work_status, run_get_orders, run_receving_order, run_update_order_state, run_kd_grabbing, run_update_order_state_kd, get_service_fee, get_invitation_code };
//# sourceMappingURL=index.js.map