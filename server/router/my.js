const express = require("express");
const router = express.Router();

//  导入处理函数
const {login, get_base_data, getSubscribeMesTIDS} = require("../router_hanlder/my");
const {login_dev} = require("../router_hanlder/my");
//  用户请求登陆
router.get("/getSubscribeMesTIDS", getSubscribeMesTIDS);
router.get("/get_base_data", get_base_data);
router.post("/login", login);
router.post("/login_dev", login_dev);

module.exports = router;
