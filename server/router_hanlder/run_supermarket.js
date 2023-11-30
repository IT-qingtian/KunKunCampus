"use strict";
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
var public_1 = require("../function/public");
// 引入订单系统
var cfg = require('../configs.js');
var order = require('../function/order.js');
// 骑手接单
var receving = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, out_trade_no, order_result, _a, type, status, order_over, data, receving_order_info, update_result, rider_ur;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                openid = req.openid, params = req.body;
                out_trade_no = params.out_trade_no;
                return [4 /*yield*/, order.queryOrder(out_trade_no)];
            case 1:
                order_result = _b.sent();
                if (!order_result.code)
                    return [2 /*return*/, (0, public_1.sendErr)(res, '订单不存在')
                        // 解析 订单类型、订单付款状态，当前状态，接单信息   思路-确定是超市类型，并且已付款 当前只是被商家接单，非自提
                    ];
                _a = order_result.data, type = _a.type, status = _a.status, order_over = _a.order_over, data = _a.data, receving_order_info = _a.receving_order_info;
                // 无法接单原因
                {
                    if (type !== 3)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '订单类型不符合。')];
                    if (status !== 1)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '本订单付款信息错误。')];
                    if (![1, 2].includes(order_over))
                        return [2 /*return*/, (0, public_1.sendErr)(res, '接单失败，商家尚未接单或订单已完成。')];
                    if (data.take_goods_mode !== 0)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '接单失败，非外派模式。')];
                    if (receving_order_info.is_merchant_dispatch)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '接单失败，本订单为商家自配送。')];
                    if (receving_order_info.delivery_info)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '接单失败，你来晚了，本订单已被别人接到了。')];
                }
                // 变更接单信息
                {
                    receving_order_info.delivery_info = {
                        openid: openid,
                        start_receving_time: (0, public_1.formatTime)(new Date())
                    };
                    receving_order_info = "'".concat(JSON.stringify(receving_order_info), "'");
                }
                return [4 /*yield*/, order.updateOrder(out_trade_no, { receving_order_info: receving_order_info })];
            case 2:
                update_result = _b.sent();
                if (!update_result.code)
                    return [2 /*return*/, (0, public_1.sendErr)(res, '接单失败')
                        // 给自身增加配送费
                    ];
                return [4 /*yield*/, (0, public_1.db_update)("update users_run set reviewAmount = reviewAmount + ? where openid = ?", [cfg.service_fee.shop_delivery * 100, openid])];
            case 3:
                rider_ur = _b.sent();
                if (!rider_ur.code)
                    console.log('@error 骑手接单错误，本订单已接单，但未增加审核金额');
                (0, public_1.sendRes)(res, null, '接单成功');
                return [2 /*return*/];
        }
    });
}); };
// 修改配送状态
var change_delivery_state = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, out_trade_no, order_result, _a, type, status, order_over, data, receving_order_info, openid_client, typeName, description, db_order_address, sql_query_run, result_run_info, _b, db_run_name, db_run_phone_number, state_msg, temp_id, values, update_result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, (0, public_1.sendErr)(res, '无法校验身份请重新登录')];
                out_trade_no = params.out_trade_no;
                return [4 /*yield*/, order.queryOrder(out_trade_no)];
            case 1:
                order_result = _c.sent();
                if (!order_result.code)
                    return [2 /*return*/, (0, public_1.sendErr)(res, '订单不存在')
                        // 解析 订单类型、订单付款状态，当前状态，接单信息   思路 确定类型、已付款、外派模式、是本人接单、商家处理好了
                    ];
                _a = order_result.data, type = _a.type, status = _a.status, order_over = _a.order_over, data = _a.data, receving_order_info = _a.receving_order_info, openid_client = _a.openid, typeName = _a.type_name, description = _a.description;
                db_order_address = data.address;
                // 公共错误
                {
                    if (type !== 3)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '配送失败，订单类型不符合。')];
                    if (data.take_goods_mode !== 0)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '修改配送状态失败，非外派模式。')
                            // 商家是否已接单
                            /*
                                订单是否完成
                                -1 订单已退款。
                                0未接单，
                                1是已接单（处理中），
                                2 等待配送
                                3 配送中
                                4 处理完毕（自提/配送完毕）
                                5 用户确认完成。
                             */
                        ];
                    // 商家是否已接单
                    /*
                        订单是否完成
                        -1 订单已退款。
                        0未接单，
                        1是已接单（处理中），
                        2 等待配送
                        3 配送中
                        4 处理完毕（自提/配送完毕）
                        5 用户确认完成。
                     */
                    if (![1, 2, 3].includes(order_over))
                        return [2 /*return*/, (0, public_1.sendErr)(res, '修改配送状态失败，商家尚未接单或订单已完成。')
                            // 外派模式
                        ];
                    // 外派模式
                    if (receving_order_info.is_merchant_dispatch)
                        return [2 /*return*/, (0, public_1.sendErr)(res, '修改配送状态失败，本订单为商家自配送。')
                            // 处于 已 接单状态 需要识别身份。
                        ];
                    // 处于 已 接单状态 需要识别身份。
                    if ((order_over in [2, 3])) {
                        // 识别身份
                        // console.log(receving_order_info.delivery_info)
                        if (receving_order_info.delivery_info === undefined)
                            return [2 /*return*/, (0, public_1.sendErr)(res, '修改配送状态失败，本订单未被接单。')];
                        if (!(receving_order_info.delivery_info && receving_order_info.delivery_info.openid === openid))
                            return [2 /*return*/, (0, public_1.sendErr)(res, '修改配送状态，非本人接单。')];
                    }
                }
                sql_query_run = "select * from users_run where openid = ?";
                return [4 /*yield*/, (0, public_1.db_query)(sql_query_run, [openid])];
            case 2:
                result_run_info = _c.sent();
                if (!result_run_info.code)
                    return [2 /*return*/, (0, public_1.sendErr)(res, '查询骑手信息遇到报错。')];
                if (!result_run_info.data.length)
                    return [2 /*return*/, (0, public_1.sendErr)(res, '服务器查询不到骑手信息。')
                        // 最终骑手信息
                    ];
                _b = result_run_info.data[0], db_run_name = _b.name, db_run_phone_number = _b.phone_number;
                // 根据目前状态来
                switch (order_over) {
                    case 1:
                        return [2 /*return*/, (0, public_1.sendErr)(res, '请先等待商家出单...')];
                    case 4:
                        return [2 /*return*/, (0, public_1.sendErr)(res, '无法操作状态，订单已完成。')
                            //  处理完毕，未开始配送
                        ];
                    //  处理完毕，未开始配送
                    case 2:
                        // 商家已处理完毕，开始配送。
                        order_over = 3;
                        state_msg = '订单已开始配送';
                        receving_order_info.delivery_info.receving_time = (0, public_1.formatTime)(new Date());
                        // 下派通知告诉用户
                        temp_id = public_1.message_tempIds.miniprogram.delivery_ing;
                        values = {
                            // 骑手称呼
                            // {{thing2.DATA}}
                            thing2: { value: "".concat(db_run_name) },
                            //     骑手电话
                            // {{phone_number3.DATA}}
                            phone_number3: { value: "".concat(db_run_phone_number) },
                            //     订单号
                            // {{character_string1.DATA}}
                            character_string1: { value: out_trade_no },
                            //     订单状态
                            // {{phrase5.DATA}}
                            phrase5: { value: '骑手配送中' }
                        };
                        break;
                    // 未知错误
                    case 3:
                        // 当前处于正在配送阶段，确认完成配送。
                        //  配送过程中，配送完毕。
                        order_over = 4;
                        (0, public_1.auto_end_order)(out_trade_no);
                        state_msg = '订单已配送完成';
                        // 刻录骑手派送时间
                        receving_order_info.delivery_info.dispatch_time = (0, public_1.formatTime)(new Date());
                        // 下派通知告诉用户
                        temp_id = public_1.message_tempIds.miniprogram.delivery_over;
                        values = {
                            // 订单名称
                            // {{thing8.DATA}}
                            // thing8: {value: typeName},
                            thing8: { value: '订单已送达' },
                            //  订单类型
                            // {{thing4.DATA}}
                            thing4: { value: description },
                            //     派送地址
                            // {{thing10.DATA}}
                            thing10: { value: db_order_address.numberPlate },
                            //     送达时间
                            // {{time2.DATA}}
                            time2: { value: (0, public_1.formatTime)(new Date()) },
                            //     备注
                            // {{thing3.DATA}}
                            thing3: { value: '订单已送达,请及时确认！' },
                        };
                        break;
                    default:
                        return [2 /*return*/, (0, public_1.sendErr)(res, '修改配送状态失败，属【状态】错误。')];
                }
                (0, public_1.emit_subscribe_msg)(openid_client, temp_id, values, 2);
                receving_order_info = "'".concat(JSON.stringify(receving_order_info), "'");
                return [4 /*yield*/, order.updateOrder(out_trade_no, { order_over: order_over, receving_order_info: receving_order_info })];
            case 3:
                update_result = _c.sent();
                if (!update_result.code)
                    return [2 /*return*/, (0, public_1.sendErr)(res, '修改配送状态失败！error：' + update_result.msg)];
                (0, public_1.sendRes)(res, null, '修改配送状态成功，' + state_msg);
                return [2 /*return*/];
        }
    });
}); };
//  导出
module.exports = {
    receving: receving,
    change_delivery_state: change_delivery_state
};
//# sourceMappingURL=run_supermarket.js.map