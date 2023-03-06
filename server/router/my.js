const express = require("express");
const router = express.Router();

//  导入处理函数
const {login} = require("../router_hanlder/my");
//  用户请求登陆
router.post("/login", login);

module.exports = router;
