const express = require("express");
const router = express.Router();
//  导入处理函数
const {orderPay, orderGet, orderCanel, confirm, orderQuery, orderUreg, appraise} = require("../router_hanlder/orders");

// 用户催促订单  参数 out_trade_no(订单号)
router.post('/orderUreg', orderUreg)

//  用户支付订单
router.post("/orderPay", orderPay);
//  用户获取订单
router.post("/orderGet", orderGet);
//  用户取消订单
router.post("/orderCanel", orderCanel);
//  用户确认订单
router.post("/confirm", confirm);
// 订单查询
router.post('/orderQuery', orderQuery)

// 用户评论订单
router.post('/appraise', appraise)


module.exports = router;
