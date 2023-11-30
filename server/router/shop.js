const express = require("express");
const router = express.Router();

const {
    getShops,
    getShop,
    createOrder,
    order_query,
    get_order_status,
    change,
    res_pay
} = require("../router_hanlder/shop");

router.post('/getShops', getShops)
router.post('/getShop', getShop)
router.post('/createOrder', createOrder)
router.post('/change', change)
router.post('/res_pay', res_pay)
router.post('/order_query', order_query)
router.post('/get_order_status', get_order_status)

module.exports = router;
