const express = require("express");
const router = express.Router();

//  导入处理函数
const {takePay, order_query} = require("../router_hanlder/kuaidi");
//  用户发起代取快递支付
router.post("/takePay", takePay);
router.post("/order_query", order_query);

module.exports = router;
