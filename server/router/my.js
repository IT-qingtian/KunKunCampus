const express = require("express");
const router = express.Router();

//  导入处理函数
const {login, getSubscribeMesTIDS} = require("../router_hanlder/my");
const {login_dev} = require("../router_hanlder/my");
//  用户请求登陆
router.get("/getSubscribeMesTIDS", getSubscribeMesTIDS);
router.post("/login", login);
router.post("/login_dev", login_dev);

module.exports = router;
