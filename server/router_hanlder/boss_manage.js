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
// 引入multiparty
var fs = require("fs");
// @ts-ignore
var path = require('path');
var multiparty = require('multiparty');
var _a = require('../function/public.js'), sendRes = _a.sendRes, sendErr = _a.sendErr, message_tempIds = _a.message_tempIds, emit_subscribe_msg = _a.emit_subscribe_msg, formatTime = _a.formatTime, db_query = _a.db_query, db_update = _a.db_update, TEMPORORAY_ADDRESS = _a.TEMPORORAY_ADDRESS;
var order = require('../function/order.js');
// 获取店铺内商品数据
var get_goods = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, re_user, shop_id, re_shop, goods;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 根据openid得到店铺id然后查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from users_boss where openid = '".concat(openid, "'"))];
            case 1:
                re_user = _a.sent();
                if (!re_user.code)
                    return [2 /*return*/, sendErr(res, '无法获取用户信息')];
                shop_id = re_user.data.length && re_user.data[0].shop_id;
                if (!shop_id)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')
                        // 查询商品sql语句
                    ];
                return [4 /*yield*/, db_query("select * from shop where id = '".concat(shop_id, "'"))];
            case 2:
                re_shop = _a.sent();
                if (!re_shop.code)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')];
                goods = re_shop.data[0].goods;
                sendRes(res, { goods: goods });
                return [2 /*return*/];
        }
    });
}); };
// 增加分组
var add_group = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, title, re_user, shop_id, re_shop, goods, sql, result_update_goods, code, err;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 参数校验
                    ];
                title = params.title;
                if (!title)
                    return [2 /*return*/, sendErr(res, '请输入分组名称！')
                        // 根据openid得到店铺id然后查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from users_boss where openid = '".concat(openid, "'"))];
            case 1:
                re_user = _a.sent();
                if (!re_user.code)
                    return [2 /*return*/, sendErr(res, '无法获取用户信息')];
                shop_id = re_user.data.length && re_user.data[0].shop_id;
                if (!shop_id)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')
                        // 查询商品sql语句
                    ];
                return [4 /*yield*/, db_query("select * from shop where id = '".concat(shop_id, "'"))];
            case 2:
                re_shop = _a.sent();
                if (!re_shop.code)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')];
                goods = re_shop.data[0].goods;
                goods.push({
                    goods: [],
                    title: title
                });
                sql = "update shop set goods = ? where id = ?";
                return [4 /*yield*/, db_update(sql, [JSON.stringify(goods), shop_id])];
            case 3:
                result_update_goods = _a.sent();
                code = result_update_goods.code, err = result_update_goods.err;
                if (!code)
                    return [2 /*return*/, sendErr(res, err)];
                sendRes(res, { title: title }, '分组添加成功');
                return [2 /*return*/];
        }
    });
}); };
// 切换上下架
var change_off_state = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, group_id, goods_id, re_user, shop_id, re_shop, goods, isEnd, index, item, sql, re_;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 参数校验
                    ];
                group_id = params.group_id, goods_id = params.goods_id;
                if (group_id === undefined)
                    return [2 /*return*/, sendErr(res, '无分组id！')];
                if (goods_id === undefined)
                    return [2 /*return*/, sendErr(res, '无商品id！')
                        // 根据openid得到店铺id然后查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from users_boss where openid = '".concat(openid, "'"))];
            case 1:
                re_user = _a.sent();
                if (!re_user.code)
                    return [2 /*return*/, sendErr(res, '无法获取用户信息')];
                shop_id = re_user.data.length && re_user.data[0].shop_id;
                if (!shop_id)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')
                        // 查询商品sql语句
                    ];
                return [4 /*yield*/, db_query("select * from shop where id = '".concat(shop_id, "'"))];
            case 2:
                re_shop = _a.sent();
                if (!re_shop.code)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')
                        //  获取goods信息
                    ];
                goods = re_shop.data[0].goods;
                isEnd = false;
                index = 0;
                _a.label = 3;
            case 3:
                if (!(index < goods[group_id].goods.length)) return [3 /*break*/, 6];
                item = goods[group_id].goods[index];
                if (!(item.id === goods_id)) return [3 /*break*/, 5];
                //  找到对应商品，打破循环。
                isEnd = true;
                console.log(goods[group_id].goods[index].isOff, 'before');
                item.isOff = !item.isOff;
                console.log(goods[group_id].goods[index].isOff, 'after');
                sql = "update shop set goods = ? where id = ?";
                return [4 /*yield*/, db_update(sql, [JSON.stringify(goods), shop_id])];
            case 4:
                re_ = _a.sent();
                if (!re_.code)
                    sendErr(res, re_.err);
                return [2 /*return*/, sendRes(res, { isOff: item.isOff }, '切换成功')];
            case 5:
                index++;
                return [3 /*break*/, 3];
            case 6:
                if (!isEnd)
                    return [2 /*return*/, sendErr(res, '无法找到对应商品！')
                        // 切换状态
                    ];
                // 切换状态
                sendRes(res, {}, '切换成功');
                return [2 /*return*/];
        }
    });
}); };
// 更改商品数据
var update_goods_data = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, group_id, goods_id, data, re_user, shop_id, re_shop, goods, goods_index, goods_accurate, sql, re_;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 参数校验
                    ];
                group_id = params.group_id, goods_id = params.goods_id, data = params.data;
                if (group_id === undefined)
                    return [2 /*return*/, sendErr(res, '无分组id！')];
                if (goods_id === undefined)
                    return [2 /*return*/, sendErr(res, '无商品id！')];
                if (!data)
                    return [2 /*return*/, sendErr(res, '数据未传入！')];
                if (!((data === null || data === void 0 ? void 0 : data.price) > 0 && typeof data.price === 'number'))
                    return [2 /*return*/, sendErr(res, '必传参数price类型错误！')];
                if (!((data === null || data === void 0 ? void 0 : data.inventory) > 0 && data.inventory && typeof data.inventory === 'number'))
                    return [2 /*return*/, sendErr(res, '必传参数inventory类型错误！')
                        // 根据openid得到店铺id然后查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from users_boss where openid = '".concat(openid, "'"))];
            case 1:
                re_user = _a.sent();
                if (!re_user.code)
                    return [2 /*return*/, sendErr(res, '无法获取用户信息')];
                shop_id = re_user.data.length && re_user.data[0].shop_id;
                if (!shop_id)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')
                        // 根据shop_id查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from shop where id = '".concat(shop_id, "'"))];
            case 2:
                re_shop = _a.sent();
                if (!re_shop.code)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')];
                goods = re_shop.data[0].goods;
                goods_index = goods[group_id].goods.findIndex(function (item) { return item.id === goods_id; });
                if (goods_index === -1)
                    return [2 /*return*/, sendErr(res, '无法找到对应商品！')
                        // 更新数据
                    ];
                goods_accurate = goods[group_id].goods[goods_index];
                goods_accurate.price = data.price;
                goods_accurate.inventory = data.inventory;
                sql = "update shop set goods = ? where id = ?";
                return [4 /*yield*/, db_update(sql, [JSON.stringify(goods), shop_id])];
            case 3:
                re_ = _a.sent();
                if (!re_.code)
                    sendErr(res, re_.err, { group_id: group_id, goods_id: goods_id });
                sendRes(res, '更新成功');
                return [2 /*return*/];
        }
    });
}); };
// 删除商品
var delete_goods = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, group_id, goods_id, re_user, shop_id, re_shop, goods, goods_index, sql, re_;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 参数校验
                    ];
                group_id = params.group_id, goods_id = params.goods_id;
                if (group_id === undefined)
                    return [2 /*return*/, sendErr(res, '无分组id！')];
                if (goods_id === undefined)
                    return [2 /*return*/, sendErr(res, '无商品id！')
                        // 根据openid得到店铺id然后查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from users_boss where openid = '".concat(openid, "'"))];
            case 1:
                re_user = _a.sent();
                if (!re_user.code)
                    return [2 /*return*/, sendErr(res, '无法获取用户信息')];
                shop_id = re_user.data.length && re_user.data[0].shop_id;
                if (!shop_id)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')
                        // 根据shop_id查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from shop where id = '".concat(shop_id, "'"))];
            case 2:
                re_shop = _a.sent();
                if (!re_shop.code)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')];
                goods = re_shop.data[0].goods;
                goods_index = goods[group_id].goods.findIndex(function (item) { return item.id === goods_id; });
                if (goods_index === -1)
                    return [2 /*return*/, sendErr(res, '无法找到对应商品！')
                        //     删除数据
                    ];
                //     删除数据
                goods[group_id].goods.splice(goods_index, 1);
                sql = "update shop set goods = ? where id = ?";
                return [4 /*yield*/, db_update(sql, [JSON.stringify(goods), shop_id])];
            case 3:
                re_ = _a.sent();
                if (!re_.code)
                    sendErr(res, re_.err, { group_id: group_id, goods_id: goods_id });
                sendRes(res, '删除成功');
                return [2 /*return*/];
        }
    });
}); };
// 删除分组
var delete_group = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var openid, params, group_id, re_user, shop_id, re_shop, goods, sql, re_;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                openid = req.openid, params = req.body;
                if (!openid)
                    return [2 /*return*/, sendErr(res, '无法校验身份请重新登录')
                        // 参数校验
                    ];
                group_id = params.group_id;
                if (group_id === undefined)
                    return [2 /*return*/, sendErr(res, '无分组id！')
                        // 根据openid得到店铺id然后查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from users_boss where openid = '".concat(openid, "'"))];
            case 1:
                re_user = _a.sent();
                if (!re_user.code)
                    return [2 /*return*/, sendErr(res, '无法获取用户信息')];
                shop_id = re_user.data.length && re_user.data[0].shop_id;
                if (!shop_id)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')
                        // 根据shop_id查询店铺信息
                    ];
                return [4 /*yield*/, db_query("select * from shop where id = '".concat(shop_id, "'"))];
            case 2:
                re_shop = _a.sent();
                if (!re_shop.code)
                    return [2 /*return*/, sendErr(res, '无法获取店铺信息')];
                goods = re_shop.data[0].goods;
                // group_id是否允许被删除。
                if (group_id > goods.length || group_id < 0)
                    return [2 /*return*/, sendErr(res, '分组错误！')
                        //     删除数据
                    ];
                //     删除数据
                goods.splice(group_id, 1);
                sql = "update shop set goods = ? where id = ?";
                return [4 /*yield*/, db_update(sql, [JSON.stringify(goods), shop_id])];
            case 3:
                re_ = _a.sent();
                if (!re_.code)
                    sendErr(res, re_.err, { group_id: group_id });
                sendRes(res, '删除成功');
                return [2 /*return*/];
        }
    });
}); };
// 修改信息
var update_shop_data = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
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
                form = new multiparty.Form({ uploadDir: TEMPORORAY_ADDRESS.shop_show, maxFilesSize: 1024 * 1024 * 8 });
                form.parse(req, function (err, fields, files) { return __awaiter(void 0, void 0, void 0, function () {
                    var code, params, imgFiles, new_img_address, key, path_1, reserve_imgs, trade_time, title, notice, type, tags, phone_number, mbp, address, start_time, end_time, trade_state, ftbh, shop_id, r_shop, del, reserve, sql, p, update_shop;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (err) {
                                    code = err.code;
                                    switch (code) {
                                        case 'ETOOBIG':
                                            return [2 /*return*/, sendErr(res, '错误！图片超过最大尺寸。')];
                                        case "ENOENT":
                                            return [2 /*return*/, sendErr(res, '文件上传到服务器失败无效，请联系管理员')];
                                        default:
                                            return [2 /*return*/, sendErr(res, '未知上传错误！')];
                                    }
                                }
                                params = JSON.parse(fields.params[0]);
                                imgFiles = files;
                                new_img_address = [];
                                // 遍历files，查看是否有文件不属于图片类这个范畴 如果有 就打断循环！
                                for (key in imgFiles) {
                                    if (!imgFiles[key][0].headers['content-type'].includes('image'))
                                        return [2 /*return*/, sendErr(res, '错误！请上传图片！')];
                                    path_1 = imgFiles[key][0].path;
                                    new_img_address.push(path_1);
                                }
                                reserve_imgs = params.reserve_imgs, trade_time = params.trade_time, title = params.title, notice = params.notice, type = params.type, tags = params.tags, phone_number = params.phone_number, mbp = params.mbp, address = params.address, start_time = params.start_time, end_time = params.end_time, trade_state = params.trade_state, ftbh = params.ftbh;
                                // 查看必要信息是否被填写
                                mbp = Number(Number(mbp).toFixed(2));
                                if (!(mbp > 0.1 && mbp < 99999))
                                    return [2 /*return*/, sendErr(res, '错误的起送价格！')];
                                if (!title || !(title.length >= 2) && !(title.length <= 10))
                                    sendErr(res, '店铺名长度必须在2~10字符');
                                if (!phone_number)
                                    sendErr(res, '必须留下电话号码');
                                if (!address || address.length > 100)
                                    sendErr(res, '必须留下店铺位置，并且位置最多不超过100字');
                                if (notice && notice.length > 300)
                                    sendErr(res, '公告过长！');
                                // 贴合周期时 必须保证全面化
                                if (ftbh && (!start_time || !end_time || !trade_time))
                                    sendErr(res, '必须填写好运营时间');
                                shop_id = result_users_boss.data[0].shop_id;
                                return [4 /*yield*/, db_query("select * from shop where id = '".concat(shop_id, "'"))];
                            case 1:
                                r_shop = _a.sent();
                                if (!r_shop.code)
                                    return [2 /*return*/, sendErr(res, '获取店铺失败！')
                                        // 需要删除的
                                    ];
                                del = r_shop.data[0].img_address.filter(function (item) { return !reserve_imgs.includes(item); });
                                reserve = r_shop.data[0].img_address.filter(function (item) { return reserve_imgs.includes(item); });
                                del.forEach(function (router) {
                                    //  删除图片
                                    fs.unlink(path.join(__dirname, '..', TEMPORORAY_ADDRESS.shop_show, router.split('\\').reverse()[0]), function (err) {
                                        if (err)
                                            console.log('重大错误！删除文件失败！');
                                    });
                                });
                                // 追加图片
                                new_img_address.unshift.apply(new_img_address, reserve);
                                sql = "UPDATE shop SET \n            title=?, \n            start_time=?, \n            end_time=?, \n            trade_time=?, \n            ftbh=?, \n            trade_state=?, \n            mbp=?, \n            tags=?, \n            type=?, \n            img_address=?, \n            phone_number=?, \n            address=?, \n            notice=?\n        WHERE id=".concat(shop_id);
                                p = [
                                    // 标题
                                    title,
                                    // 营业时间
                                    start_time,
                                    // 打烊时间
                                    end_time,
                                    // 营业周期
                                    JSON.stringify(trade_time),
                                    // 自动贴合营业周期
                                    ftbh,
                                    // 营业状态
                                    trade_state,
                                    // 配送起步价
                                    mbp,
                                    // 标签
                                    JSON.stringify(tags),
                                    // 店铺类型
                                    type,
                                    // 图片组
                                    JSON.stringify(new_img_address),
                                    // 电话
                                    phone_number,
                                    // 地址
                                    address,
                                    // 公告
                                    notice
                                ];
                                return [4 /*yield*/, db_update(sql, p)];
                            case 2:
                                update_shop = _a.sent();
                                update_shop.code ? sendRes(res) : sendErr(res, update_shop.err);
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
        }
    });
}); };
exports.default = {
    get_goods: get_goods,
    add_group: add_group,
    change_off_state: change_off_state,
    update_goods_data: update_goods_data,
    delete_goods: delete_goods,
    delete_group: delete_group,
    update_shop_data: update_shop_data
};
//# sourceMappingURL=boss_manage.js.map