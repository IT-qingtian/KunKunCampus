const express = require("express");
const router = express.Router();
//  导入处理函数
const {
    takePay,
    order_query,
    user_add_address,
    user_update_address,
    end_order,
    delete_order
} = require("../router_hanlder/kuaidi");


//  用户发起代取快递支付
router.post("/takePay", takePay);
//  订单查询
router.post("/order_query", order_query);
//  添加地址
router.post("/user_add_address", user_add_address);
//  修改地址
router.post("/user_update_address", user_update_address);
// 确认结束订单
router.post('/end_order', end_order)
// 删除订单
router.post('/delete_order', delete_order)

module.exports = router;
