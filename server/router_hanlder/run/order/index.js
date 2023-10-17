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
var public_js_1 = require("../../../function/public.js");
//  获取订单
var get_orders = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, body, out_trade_no, d_user, user, sql, d_orders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, body = req.body;
                out_trade_no = body.out_trade_no;
                return [4 /*yield*/, (0, public_js_1.db_query)('select * from users_run where openid=?', openid)];
            case 1:
                d_user = _a.sent();
                if (!d_user.code)
                    return [2 /*return*/, (0, public_js_1.sendErr)(res, '获取用户信息失败' + d_user.err)];
                if (d_user.data.length === 0)
                    return [2 /*return*/, (0, public_js_1.sendErr)(res, '用户不存在')];
                user = d_user.data[0];
                //  是否处于营业中
                if (!user.work_ing)
                    return [2 /*return*/, (0, public_js_1.sendErr)(res, '请先开启工作状态！')
                        // 根据自身是否传入订单号来判别
                    ];
                sql = "select * from orders where  order_over=1  and status=1";
                if (out_trade_no)
                    sql += "  and out_trade_no=".concat(out_trade_no);
                return [4 /*yield*/, (0, public_js_1.db_query)(sql)
                    // 空数据造成错误
                ];
            case 2:
                d_orders = _a.sent();
                // 空数据造成错误
                if (d_orders.eCode === 100 && !out_trade_no)
                    return [2 /*return*/, (0, public_js_1.sendRes)(res, [], '暂无订单')];
                if (out_trade_no) {
                    // 空数据
                    if (!d_orders.code)
                        return [2 /*return*/, (0, public_js_1.sendErr)(res, '无订单。')];
                    d_orders.data = d_orders.data[0];
                    //    订单是否已接单
                    console.log(d_orders);
                    if (d_orders.data.receving_order_info.delivery_info) {
                        //     已接单 验证是否是自己
                        return [2 /*return*/, d_orders.data.receving_order_info.delivery_info.openid === openid ? (0, public_js_1.sendRes)(res, d_orders.data) : (0, public_js_1.sendErr)(res, '非本人接单，无权查看！')];
                    }
                }
                (0, public_js_1.sendRes)(res, d_orders.data);
                return [2 /*return*/];
        }
    });
}); };
// 导出
module.exports = { get_orders: get_orders };
//# sourceMappingURL=index.js.map