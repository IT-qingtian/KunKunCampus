const express = require('express');
// 创建路由
const router = express.Router();

// 引入处理子函数

import boss from '../router_hanlder/boss.js'

// 超市模式
import supermarket from '../router_hanlder/boss_supermarket'
// 管理接口
import manage from '../router_hanlder/boss_manage'

// const supermarket = require('../router_hanlder/boss_supermarket.js')

// 商家-登陆
router.post('/login', boss.login)
//
// 获取店铺信息
router.post('/shopInfo', boss.getShopInfo)

// 拉取自身订单
router.post('/pull_order', supermarket.pull_order)

// 超市-接单
router.post('/supermarket/receving_order', supermarket.receving_order)

// 超市-订单派送
router.post('/supermarket/dispatch_order', supermarket.dispatch_order)

// 订单送达。
router.post('/supermarket/over_order', supermarket.over_order)

// 添加商品
router.post('/supermarket/add_goods', supermarket.add_goods)


/*店铺管理 */
// 获取商品数据
router.post('/manage/get_goods', manage.get_goods)

// 增加分组
router.post('/manage/add_group', manage.add_group)

// 切换上下架
router.post('/manage/change_off_state', manage.change_off_state)

//  变更商品数据
router.post('/manage/update_goods_data', manage.update_goods_data)
// 删除商品
router.post('/manage/delete_goods', manage.delete_goods)
// 删除分组
router.post('/manage/delete_group', manage.delete_group)

// 修改店铺信息
router.post('/shop/update_shop_data', manage.update_shop_data)

// 暴露出去
module.exports = router