"use strict";
// 《《超市模式》》
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// 接入公共函数
// import {format} from "mysql2";
var path = require('path');
var fs = require("fs");
// 引入multiparty
var multiparty = require('multiparty');
var _a = require('../function/public.js'), sendRes = _a.sendRes, sendErr = _a.sendErr, message_tempIds = _a.message_tempIds, emit_subscribe_msg = _a.emit_subscribe_msg, formatTime = _a.formatTime, db_query = _a.db_query, db_update = _a.db_update, generateRandomNumber = _a.generateRandomNumber, TEMPORORAY_ADDRESS = _a.TEMPORORAY_ADDRESS;
var order = require('../function/order.js');
// ==================================START========================================
//               0未接单，
//               1是已接单（处理中），
//               2 等待配送
//               3 配送中
//               4 配送/自提  订单完毕
// ==================================END========================================
// 商家接单  参数：out_trade_no（订单号）  is_merchant_dispatch（是否商家自送）
var receving_order = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, _a, out_trade_no, is_merchant_dispatch, order_result, code, data, status, order_over, order_db_openid, order_data, total, data_shop_id, data_goods, data_take_goods_mode, sql_query_boss, result_boss_info, boss_info, shop_id, reviewAmount, sql_query_shop, shop_db, _b, shop_db_id, shop_db_title, shop_phone_number, receving_order_info, update_result, sql_add_reviewAmount, result_update_boss, code_1, err, update_result_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                openid = req.openid;
                // 校验参数
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 获取参数
                    ];
                _a = req.body, out_trade_no = _a.out_trade_no, is_merchant_dispatch = _a.is_merchant_dispatch;
                return [4 /*yield*/, order.queryOrder(out_trade_no)
                    // 校验订单
                ];
            case 1:
                order_result = _c.sent();
                code = order_result.code, data = order_result.data;
                if (!code)
                    return [2 /*return*/, sendErr(res, '订单不存在')
                        // 解析data-这里是订单数据
                    ];
                status = data.status, order_over = data.order_over, order_db_openid = data.openid, order_data = data.data, total = data.total;
                data_shop_id = order_data.shop_id, data_goods = order_data.goods, data_take_goods_mode = order_data.take_goods_mode;
                sql_query_boss = "select * from users_boss where openid = ?";
                return [4 /*yield*/, db_query(sql_query_boss, [openid])];
            case 2:
                result_boss_info = _c.sent();
                if (!result_boss_info.code)
                    return [2 /*return*/, sendErr(res, '接单失败，查询商家信息遇到报错。')];
                if (!result_boss_info.data.length)
                    return [2 /*return*/, sendErr(res, '接单失败，服务器查询不到商家信息。')
                        // 最终商家信息
                    ];
                boss_info = result_boss_info.data[0];
                shop_id = boss_info.shop_id, reviewAmount = boss_info.reviewAmount;
                sql_query_shop = "select * from shop where id = ?";
                return [4 /*yield*/, db_query(sql_query_shop, [shop_id])];
            case 3:
                shop_db = _c.sent();
                if (!shop_db.code)
                    return [2 /*return*/, sendErr(res, '查询店铺遇到报错。')];
                if (!shop_db.data.length)
                    return [2 /*return*/, sendErr(res, '服务器查询不到商家店铺信息。')];
                _b = shop_db.data[0], shop_db_id = _b.id, shop_db_title = _b.title, shop_phone_number = _b.phone_number;
                //     比对shop_id
                if (!(data_shop_id === shop_id && shop_id === shop_db_id))
                    return [2 /*return*/, sendErr(res, '错误，非本店铺订单。')
                        //     根据 付款和接单状态 来确定是否能够接单
                    ];
                if (!(status == 1 && order_over == 0)) return [3 /*break*/, 8];
                receving_order_info = "'".concat(JSON.stringify({
                    shop_info: {
                        openid: openid,
                        shop_id: shop_id,
                        receving_time: formatTime()
                    },
                    is_merchant_dispatch: is_merchant_dispatch
                }), "'");
                return [4 /*yield*/, order.updateOrder(out_trade_no, { order_over: 1, receving_order_info: receving_order_info })
                    // 判定状态
                ];
            case 4:
                update_result = _c.sent();
                // 判定状态
                if (!update_result.code)
                    return [2 /*return*/, sendErr(res, '接单失败，修改订单重要信息错误。')
                        // 增加老板的审核金额
                    ];
                sql_add_reviewAmount = "update users_boss set reviewAmount = ? where shop_id = ?";
                return [4 /*yield*/, db_update(sql_add_reviewAmount, [reviewAmount + total, shop_id])];
            case 5:
                result_update_boss = _c.sent();
                code_1 = result_update_boss.code, err = result_update_boss.err;
                if (!!code_1) return [3 /*break*/, 7];
                console.log('增加审核金额失败 回退信息。');
                return [4 /*yield*/, order.updateOrder(out_trade_no, {
                        order_over: 0,
                        receving_order_info: null
                    })];
            case 6:
                update_result_1 = _c.sent();
                if (!update_result_1.code)
                    console.error('超级大错误,无法回退信息。');
                return [2 /*return*/, sendErr(res, err)];
            case 7:
                // 订阅消息-通知用户已接单
                emit_subscribe_msg(order_db_openid, message_tempIds.miniprogram.receving_order, {
                    // 接单时间
                    // {{time2.DATA}}
                    time2: {
                        value: formatTime(1)
                    },
                    // 服务类型
                    // {{thing1.DATA}}
                    thing1: { value: data_take_goods_mode ? "用户自提" : '配送服务' },
                    // 接单员
                    // {{thing6.DATA}}
                    thing6: { value: "".concat(shop_db_title) },
                    // 接单员电话
                    // {{phone_number5.DATA}}
                    phone_number5: { value: shop_phone_number },
                    // 备注
                    // {{thing4.DATA}}
                    thing4: { value: '店铺已接单，正在处理中。' },
                }, 2, '17xf.cq.cn', '商户已接单');
                sendRes(res, null, '接单成功。');
                return [3 /*break*/, 9];
            case 8:
                // 没付款
                if (status == 0)
                    return [2 /*return*/, sendErr(res, '订单未付款')
                        // 非未接单
                    ];
                // 非未接单
                else if (order_over !== 0)
                    return [2 /*return*/, sendErr(res, '错误，订单已接单')];
                else
                    return [2 /*return*/, sendErr(res, '订单状态异常')];
                _c.label = 9;
            case 9: return [2 /*return*/];
        }
    });
}); };
// 商家派送（完成）订单 参数：out_trade_no（订单号）   如果是自提模式 那就会直接成为已完成处理完毕。
var dispatch_order = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, out_trade_no, result_order, code, dt_order, openid_, status, data_, order_over, receving_order_info, typeName, take_goods_mode, take_goods_code, order_shop_id, sql_query_boss, result_boss_info, shop_id, sql_query_shop, result_shop_db, _a, shop_db_id, shop_db_title, shop_phone_number, db_shop_address, is_merchant_dispatch, msg_, temp_id, values, emit_, result_update;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')];
                out_trade_no = params.out_trade_no;
                if (!out_trade_no)
                    return [2 /*return*/, sendErr(res, '订单号不能为空')
                        //  查询订单
                    ];
                return [4 /*yield*/, order.queryOrder(out_trade_no)];
            case 1:
                result_order = _b.sent();
                code = result_order.code, dt_order = result_order.data;
                if (!code)
                    return [2 /*return*/, sendErr(res, '订单查询遇到错误')];
                openid_ = dt_order.openid, status = dt_order.status, data_ = dt_order.data, order_over = dt_order.order_over, receving_order_info = dt_order.receving_order_info, typeName = dt_order.type_name;
                take_goods_mode = data_.take_goods_mode, take_goods_code = data_.take_goods_code, order_shop_id = data_.shop_id;
                // 需要订单状态是已付款并且为已接单
                if (!(status === 1 && order_over === 1)) {
                    console.log(dt_order);
                    return [2 /*return*/, sendErr(res, '订单状态异常,无法派送订单。')];
                }
                sql_query_boss = "select * from users_boss where openid = ?";
                return [4 /*yield*/, db_query(sql_query_boss, [openid])];
            case 2:
                result_boss_info = _b.sent();
                if (!result_boss_info.code)
                    return [2 /*return*/, sendErr(res, '接单失败，查询商家信息遇到报错。')];
                if (!result_boss_info.data.length)
                    return [2 /*return*/, sendErr(res, '接单失败，服务器查询不到商家信息。')
                        // 最终商家信息
                    ];
                shop_id = result_boss_info.data[0].shop_id;
                sql_query_shop = "select * from shop where id = ?";
                return [4 /*yield*/, db_query(sql_query_shop, [shop_id])];
            case 3:
                result_shop_db = _b.sent();
                if (!result_shop_db.code)
                    return [2 /*return*/, sendErr(res, '查询店铺遇到报错。')];
                if (!result_shop_db.data.length)
                    return [2 /*return*/, sendErr(res, '服务器查询不到商家店铺信息。')];
                _a = result_shop_db.data[0], shop_db_id = _a.id, shop_db_title = _a.title, shop_phone_number = _a.phone_number, db_shop_address = _a.address;
                //     比对shop_id
                if (!(order_shop_id === shop_id && shop_id === shop_db_id))
                    return [2 /*return*/, sendErr(res, '错误，非本店铺订单。')
                        // 是否商家自配送
                    ];
                is_merchant_dispatch = receving_order_info.is_merchant_dispatch;
                // 自提 直接上档   配送模式，需要区分是否是等待、外派  (如果是自提模式 直接成为完单，外送模式-如果是外派 那就变成等待派送，否则派送中)
                order_over = take_goods_mode ? 4 : is_merchant_dispatch ? 3 : 2;
                emit_ = true;
                switch (order_over) {
                    case 2:
                        // 防止发送订阅消息
                        emit_ = false;
                        msg_ = '等待骑手配送';
                        break;
                    case 3:
                        msg_ = '商家正在配送';
                        // 创建配送信息
                        receving_order_info.delivery_info = {
                            openid: openid,
                            receving_time: formatTime()
                        };
                        temp_id = message_tempIds.miniprogram.delivery_ing;
                        values = {
                            // 骑手称呼
                            // {{thing2.DATA}}
                            thing2: { value: "".concat(shop_db_title) },
                            //     骑手电话
                            // {{phone_number3.DATA}}
                            phone_number3: { value: "".concat(shop_phone_number) },
                            //     订单号
                            // {{character_string1.DATA}}
                            character_string1: { value: out_trade_no },
                            //     订单状态
                            // {{phrase5.DATA}}
                            phrase5: { value: '商户配送中' }
                        };
                        break;
                    case 4:
                        msg_ = '通知商户自提';
                        temp_id = message_tempIds.miniprogram.delivery_over;
                        values = {
                            // 订单名称
                            // {{thing8.DATA}}
                            thing8: { value: '自提通知' },
                            // thing8: {value: typeName},
                            //  订单类型
                            // {{thing4.DATA}}
                            thing4: { value: dt_order.description },
                            //     派送地址
                            // {{thing10.DATA}}
                            thing10: { value: db_shop_address },
                            //     送达时间
                            // {{time2.DATA}}
                            time2: { value: formatTime(1) },
                            //     备注
                            // {{thing3.DATA}}
                            thing3: { value: "\u8BF7\u524D\u5F80\u95E8\u9762\u81EA\u63D0\uFF0C\u81EA\u63D0\u7801[".concat(take_goods_code, "]") },
                        };
                        break;
                }
                // 刻录商家派送时间
                receving_order_info.shop_info.dispatch_time = formatTime();
                receving_order_info = "'".concat(JSON.stringify(__assign({}, receving_order_info)), "'");
                return [4 /*yield*/, order.updateOrder(out_trade_no, { receving_order_info: receving_order_info, order_over: order_over })
                    //   返回结果
                ];
            case 4:
                result_update = _b.sent();
                //   返回结果
                if (!result_update.code)
                    return [2 /*return*/, sendErr(res, '订单更新失败，具体error原因如下：' + result_update.msg)
                        // 发送订阅消息 进行微信通知用户
                    ];
                // 发送订阅消息 进行微信通知用户
                if (emit_)
                    emit_subscribe_msg(openid_, temp_id, values, 2, '17xf.cq.cn', '通知用户 正处于配送/自提');
                return [2 /*return*/, sendRes(res, null, msg_)];
        }
    });
}); };
// 商户派送完毕
var over_order = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, out_trade_no, result_order, code, dt_order, user_openid, status, data_, receving_order_info, order_over, is_merchant_dispatch, delivery_info, result_update, temp_id, values;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')];
                out_trade_no = params.out_trade_no;
                if (!out_trade_no)
                    return [2 /*return*/, sendErr(res, '订单号不能为空')
                        //  查询订单
                    ];
                return [4 /*yield*/, order.queryOrder(out_trade_no)];
            case 1:
                result_order = _a.sent();
                code = result_order.code, dt_order = result_order.data;
                if (!code) {
                    console.log(out_trade_no);
                    return [2 /*return*/, sendErr(res, '订单查询遇到错误')];
                }
                user_openid = dt_order.openid, status = dt_order.status, data_ = dt_order.data, receving_order_info = dt_order.receving_order_info, order_over = dt_order.order_over;
                // 需要订单状态是已付款并且为处理中
                if (!(status === 1 && order_over === 3))
                    return [2 /*return*/, sendErr(res, '订单状态异常,无法确认完成订单。')
                        // 结构派送信息
                    ];
                is_merchant_dispatch = receving_order_info.is_merchant_dispatch, delivery_info = receving_order_info.delivery_info;
                if (!is_merchant_dispatch)
                    return [2 /*return*/, sendErr(res, '抱歉，非商家派送订单，你无权确认送达。')
                        // 刻录配送时间
                    ];
                // 刻录配送时间
                delivery_info.dispatch_time = formatTime();
                //   更新
                receving_order_info = "'".concat(JSON.stringify(__assign({}, receving_order_info)), "'");
                // 派送到达，订单完毕。
                order_over = 4;
                return [4 /*yield*/, order.updateOrder(out_trade_no, { order_over: order_over, receving_order_info: receving_order_info })];
            case 2:
                result_update = _a.sent();
                if (!result_update.code)
                    return [2 /*return*/, sendErr(res, '订单更新失败，具体error原因如下：' + result_update.msg)
                        // 发送订阅消息
                    ];
                temp_id = message_tempIds.miniprogram.delivery_over;
                values = {
                    // 订单名称
                    // {{thing8.DATA}}
                    thing8: { value: '订单已送达' },
                    //  订单类型
                    // {{thing4.DATA}}
                    thing4: { value: dt_order.description },
                    //     派送地址
                    // {{thing10.DATA}}
                    thing10: { value: data_.address.numberPlate },
                    //     送达时间
                    // {{time2.DATA}}
                    time2: { value: formatTime(1) },
                    //     备注
                    // {{thing3.DATA}}
                    thing3: { value: '订单已送达,请及时确认！(5小时后无操作自动默认送达)' },
                };
                emit_subscribe_msg(user_openid, temp_id, values, 2, '17xf.cq.cn', '通知用户已送达');
                sendRes(res, null, '订单送达完毕。');
                return [2 /*return*/];
        }
    });
}); };
// 拉取订单  如果传入参数 那就是拉取订单号，如果不传入参数，那就是拉取所有订单
var pull_order = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, out_trade_no, is_to_day, result, code, data, msg, sql_query_boss, result_boss, shop_id, types, sql_query, result_order, code, data, err;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, params = req.body;
                out_trade_no = params.out_trade_no, is_to_day = params.is_to_day;
                if (!out_trade_no) return [3 /*break*/, 2];
                return [4 /*yield*/, order.queryOrder(out_trade_no)];
            case 1:
                result = _a.sent();
                code = result.code, data = result.data, msg = result.msg;
                if (!code)
                    return [2 /*return*/, sendErr(res, msg)];
                return [2 /*return*/, sendRes(res, data, '拉取订单成功！')];
            case 2:
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 通过openid查询老板信息
                    ];
                sql_query_boss = 'select * from users_boss where openid = ?';
                return [4 /*yield*/, db_query(sql_query_boss, openid)];
            case 3:
                result_boss = _a.sent();
                if (!result_boss.code)
                    return [2 /*return*/, sendErr(res, '查询商户信息错误')];
                if (!result_boss.data.length)
                    return [2 /*return*/, sendErr(res, '找不到商户信息')];
                shop_id = result_boss.data[0].shop_id;
                types = [2, 3];
                sql_query = "SELECT * FROM orders WHERE status > 0 and type IN (?) and data ->> '$.shop_id' = ?";
                // 是否只查询今日
                if (is_to_day) {
                    sql_query += ' and YEAR(time_pay_order) = YEAR(CURDATE()) AND MONTH(time_pay_order) = MONTH(CURDATE()) AND DAY(time_pay_order) = DAY(CURDATE())';
                }
                return [4 /*yield*/, db_query(sql_query, [types, shop_id])];
            case 4:
                result_order = _a.sent();
                code = result_order.code, data = result_order.data, err = result_order.err;
                if (!code)
                    return [2 /*return*/, sendErr(res, err)
                        // 返回订单
                    ];
                // 返回订单
                sendRes(res, data, '拉取订单成功！');
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
//  添加商品
var add_goods = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, sql, result_users_boss, form;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid;
                sql = 'select * from users_boss where openid = ?';
                return [4 /*yield*/, db_query(sql, [openid])];
            case 1:
                result_users_boss = _a.sent();
                if (!result_users_boss.code)
                    return [2 /*return*/, sendErr(res, '身份验证失败！' + result_users_boss.err)
                        // 解析表单
                    ];
                form = new multiparty.Form({ uploadDir: TEMPORORAY_ADDRESS.shop_goods_show, maxFilesSize: 1024 * 1024 * 5 });
                form.parse(req, function (err, fields, files) { return __awaiter(void 0, void 0, void 0, function () {
                    var code_2, params, imgFiles, key, urlParams, name, price, inventory, not_inventory, group, tags, is_edit_mode, edit_goods_index, imgs_params, imgFiles_keys, shop_id, sql_select_shop, query_shop, code, data, goods, add_goods_group, goods_1, sql_update_shop, result_update_shop;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (err) {
                                    code_2 = err.code;
                                    switch (code_2) {
                                        case 'ETOOBIG':
                                            return [2 /*return*/, sendErr(res, '错误！图片超过最大尺寸。')];
                                        default:
                                            return [2 /*return*/, sendErr(res, '未知上传错误！')];
                                    }
                                }
                                params = JSON.parse(fields.params[0]);
                                imgFiles = files;
                                // 遍历files，查看是否有文件不属于图片类这个范畴 如果有 就打断循环！
                                for (key in imgFiles)
                                    if (!imgFiles[key][0].headers['content-type'].includes('image'))
                                        return [2 /*return*/, sendErr(res, '错误！请上传图片！')
                                            // 信息解码
                                        ];
                                urlParams = params.urlParams, name = params.name, price = params.price, inventory = params.inventory, not_inventory = params.not_inventory, group = params.group, tags = params.tags, is_edit_mode = params.is_edit_mode, edit_goods_index = params.edit_goods_index, imgs_params = params.imgs_params;
                                console.log(params, 'params');
                                //  必要信息校验
                                if (!is_edit_mode) {
                                    imgFiles_keys = Object.keys(imgFiles);
                                    if (!imgFiles_keys.length)
                                        return [2 /*return*/, sendErr(res, '请至少上传一张图片')
                                            // 校验分组id、物品id参数是否齐全
                                            // if (urlParams.group_id == undefined || urlParams.goods_id == undefined) return sendErr(res, '参数不齐全')
                                        ];
                                    // 校验分组id、物品id参数是否齐全
                                    // if (urlParams.group_id == undefined || urlParams.goods_id == undefined) return sendErr(res, '参数不齐全')
                                    if (urlParams.group_id == undefined)
                                        return [2 /*return*/, sendErr(res, '请传入分组id')];
                                }
                                if (!(name && name.length > 1 && name.length < 10))
                                    return [2 /*return*/, sendErr(res, '解析表单错误，error:商品名')];
                                if (!(price && price > 0.1 && name.length < 99999))
                                    return [2 /*return*/, sendErr(res, '解析表单错误，error:商品价格')
                                        // 不是无限制库存
                                    ];
                                // 不是无限制库存
                                console.log(!not_inventory, (inventory > 1 && inventory < 99999), inventory);
                                // if (!not_inventory && (inventory > 1 && inventory < 99999)) return sendErr(res, '解析表单错误，error:商品库存');
                                if (!not_inventory && !(inventory > 1 && inventory < 99999))
                                    return [2 /*return*/, sendErr(res, '解析表单错误，error:商品库存')];
                                if (group === undefined && group < 0)
                                    return [2 /*return*/, sendErr(res, '解析表单错误，没有选择分组。')
                                        // 根据商户id来选择店铺id
                                    ];
                                shop_id = result_users_boss.data[0].shop_id;
                                sql_select_shop = 'select * from shop where id = ?';
                                return [4 /*yield*/, db_query(sql_select_shop, [shop_id])];
                            case 1:
                                query_shop = _b.sent();
                                code = query_shop.code, data = query_shop.data;
                                if (!code)
                                    return [2 /*return*/, sendErr(res, '错误，匹配店铺失败！' + query_shop.err)];
                                if (!data.length)
                                    return [2 /*return*/, sendErr(res, '无商店配对' + query_shop.err)];
                                goods = data[0].goods;
                                add_goods_group = goods[group].goods;
                                // 模式选择 - 修改模式
                                if (is_edit_mode) {
                                    goods_1 = goods[urlParams.group_id].goods[edit_goods_index];
                                    !goods_1 && sendErr(res, '找不到对应数据！');
                                    goods_1.id !== urlParams.goods_id && sendErr(res, '错误，数据匹配失败！');
                                    // 修改内容
                                    goods_1.name = name;
                                    goods_1.price = price;
                                    goods_1.inventory = not_inventory ? 999999 : inventory;
                                    goods_1.tags = tags;
                                    goods_1.not_inventory = not_inventory;
                                    //  如果有移除的图片
                                    imgs_params.remove_indexs.length && imgs_params.remove_indexs.forEach(function (goods_index) {
                                        // 路径
                                        var router = goods_1.img_address[goods_index];
                                        // 如果路径为空 那就打断本次循环
                                        if (!router)
                                            return;
                                        // 置空
                                        goods_1.img_address[goods_index] = null;
                                        // 删除文件
                                        fs.unlink(path.join(__dirname, '..', TEMPORORAY_ADDRESS.shop_goods_show, router.split('/').reverse()[0]), function (err) {
                                            // console.log(path.join(__dirname, '..', TEMPORORAY_ADDRESS.shop_goods_show, file_name))
                                            if (err)
                                                console.log('重大错误！删除文件失败！');
                                        });
                                    });
                                    //  删除空
                                    imgs_params.remove_indexs.length && (goods_1.img_address = goods_1.img_address.filter(function (item) { return item; }));
                                    //  追加图片地址
                                    (_a = goods_1.img_address).push.apply(_a, Object.keys(imgFiles).map(function (item) { return imgFiles[item][0].path.replaceAll('\\', '/'); }));
                                    // 如果分组不一样 那就移植分组
                                    if (group !== urlParams.group_id) {
                                        // 移植分组
                                        add_goods_group.push(__assign({}, goods_1));
                                        // 删除原分组商品
                                        goods[urlParams.group_id].goods.splice(edit_goods_index, 1);
                                    }
                                }
                                else {
                                    // 数据增加
                                    // const {name, price, inventory, not_inventory, group, tags} = json
                                    add_goods_group.push({
                                        // 随机id
                                        id: generateRandomNumber(),
                                        // 商品名
                                        name: name,
                                        // 下架状态
                                        isOff: false,
                                        //  价格
                                        price: price,
                                        // 标签
                                        tags: tags,
                                        //  库存
                                        inventory: not_inventory ? 999999 : inventory,
                                        // 限量
                                        not_inventory: not_inventory,
                                        // 图片路径
                                        img_address: Object.keys(files).map(function (item) { return files[item][0].path.replaceAll('\\', '/'); }),
                                        //  月销量
                                        month_sales: 0
                                    });
                                }
                                sql_update_shop = 'update shop set goods = ? where id = ?';
                                return [4 /*yield*/, db_update(sql_update_shop, [JSON.stringify(goods), shop_id])];
                            case 2:
                                result_update_shop = _b.sent();
                                if (!result_update_shop.code)
                                    return [2 /*return*/, sendErr(res, '更新数据库失败！' + result_update_shop.err)];
                                sendRes(res);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
exports.default = {
    receving_order: receving_order,
    dispatch_order: dispatch_order,
    over_order: over_order,
    pull_order: pull_order,
    add_goods: add_goods
};
//# sourceMappingURL=boss_supermarket.js.map