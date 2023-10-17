"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
// 创建路由
var router = express.Router();
// 引入处理子函数
var boss_js_1 = require("../router_hanlder/boss.js");
// 超市模式
var boss_supermarket_1 = require("../router_hanlder/boss_supermarket");
// 管理接口
var boss_manage_1 = require("../router_hanlder/boss_manage");
// const supermarket = require('../router_hanlder/boss_supermarket.js')
// 商家-登陆
router.post('/login', boss_js_1.default.login);
//
// 获取店铺信息
router.post('/shopInfo', boss_js_1.default.getShopInfo);
// 拉取自身订单
router.post('/pull_order', boss_supermarket_1.default.pull_order);
// 超市-接单
router.post('/supermarket/receving_order', boss_supermarket_1.default.receving_order);
// 超市-订单派送
router.post('/supermarket/dispatch_order', boss_supermarket_1.default.dispatch_order);
// 订单送达。
router.post('/supermarket/over_order', boss_supermarket_1.default.over_order);
// 添加商品
router.post('/supermarket/add_goods', boss_supermarket_1.default.add_goods);
/*店铺管理 */
// 获取商品数据
router.post('/manage/get_goods', boss_manage_1.default.get_goods);
// 增加分组
router.post('/manage/add_group', boss_manage_1.default.add_group);
// 切换上下架
router.post('/manage/change_off_state', boss_manage_1.default.change_off_state);
//  变更商品数据
router.post('/manage/update_goods_data', boss_manage_1.default.update_goods_data);
// 删除商品
router.post('/manage/delete_goods', boss_manage_1.default.delete_goods);
// 删除分组
router.post('/manage/delete_group', boss_manage_1.default.delete_group);
// 修改店铺信息
router.post('/shop/update_shop_data', boss_manage_1.default.update_shop_data);
// 暴露出去
module.exports = router;
//# sourceMappingURL=boss.js.map