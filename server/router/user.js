const express = require("express");
const router = express.Router();

//  导入处理函数
const {
    user_address,
    user_add_address,
    user_delete_address,
    user_update_address,
    select_default_address
} = require("../router_hanlder/user");


// 查
router.post("/user_address", user_address);
// 增
router.post("/user_add_address", user_add_address);
// 删
router.post("/user_delete_address", user_delete_address);
// 改
router.post("/user_update_address", user_update_address);

router.post("/select_default_address", select_default_address);

module.exports = router;
