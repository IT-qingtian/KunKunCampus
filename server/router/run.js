const express = require("express");
const router = express.Router();

// 导入处理函数
const {login, get_user_info} = require("../router_hanlder/run");

// 抢单、获取订单
const {grabbing, cancel, showKdOrder, showKdOrderOne, overOrder, update_state} = require("../router_hanlder/run_kd");

const {receving, change_delivery_state} = require("../router_hanlder/run_supermarket");

const {change_work_status} = require("../router_hanlder/run/user");
const {get_orders} = require("../router_hanlder/run/order");


// 登录
router.post('/login', login)

// 获取自身信息
router.post('/get_user_info', get_user_info)


// 抢单
router.post('/kd/grabbing', grabbing)

router.post('/kd/update_state', update_state)

//  取消订单
router.post('/kd/cancel', cancel)

//  获取所有订单
router.post('/kd/showKdOrder', showKdOrder)

// 展示某一订单
router.post('/kd/showKdOrderOne', showKdOrderOne)

// 骑手完成订单
router.post('/kd/overOrder', overOrder)

// 骑手接单
router.post('/supermarket/receving', receving)

// 骑手修改订单状态。
router.post('/supermarket/change_delivery_state', change_delivery_state)

// 修改工作状态
router.post('/change_work_status', change_work_status)
// 获取订单
router.post('/get_orders', get_orders)
// 接单
// router.post('/receving_orders', receving)

module.exports = router