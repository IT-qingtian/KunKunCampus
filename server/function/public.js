const cfg = require("../configs");
const ax = require("axios");
const {temp_id, service_fee} = require("../configs");
//  引入jwt
const jwt = require('jsonwebtoken')
// 引入fs模块

const fs = require('fs')
// const {orderQuery} = require("../router_hanlder/orders");
// 引入订单系统
const orderSystem = require('../function/order')
//  骑手_id 微信公众号
const qs = ['oXtBs5u1BJNz2iH-wtiSnTIcUQ78', 'oXtBs5tfePWYaFcWZJOvLPgUqKMY']
const TEMPORORAY_ADDRESS = {
//  商户展示图
    shop_goods_show: 'static\\shop\\goods_show', // 店铺图
    shop_show: 'static\\shop\\img',
}


// 消息模板qq
const message_tempIds = {
    // 公众号
    official: {
        // 任务完成
        over: "Y-2ZsrO8EmWyccivbda-o4iXTwZBbyYYQ-iebVT31wI"
    }, // 小程序
    miniprogram: {
        // 订单取消
        cancel_order: "-JQis-Z-Y9al-SCQvgxGQYoSisPxWsNruWrLO9Iw8Mc", // 付款完成
        payOver: '6noRpLYC3O78mFA8xMfT_hOnFmSasUsSMD6SX-rfyWQ',

        // 被接单提醒
        receving_order: "JwNtkdM8LULoFV842mMBLj4N2e9sm5-QZFOs-L2OPeQ", // 等待配送

        delivery_wait: "",

        // 配送中
        delivery_ing: 'vu_0-gZhWOPjWtVy59xqUkaA5Xekor64nLM4lFqK9fI', // 配送到达
        delivery_over: 'un0JonFq4NTn7yLMux4o8AXR56cBC9bhpIOFIayItGE',

        // 取快递订单到达
        kd_substitute_over: 'un0JonFq4NTn7yLMux4o8AXR56cBC9bhpIOFIayItGE'

        // 订单到达
        // over: "un0JonFq4NTn7yLMux4o8OBtmfYUEFz2pBP6vVf6ZrE"
    }
}

//  发送订阅消息 1接受者用户id 2需要传入模板id 3传入消息信息 4消息类型，默认不传是公众号 [1]是公众号消息模板 [2]是小程序
const emit_subscribe_msg = async (openid, temp_id, temp_data, emit_type, url, explain) => {
    //  获取url
    let getUrl
    // 发送数据
    const emitData = {
        //  用户openid
        "touser": openid, //  消息模板id
        "template_id": temp_id, //  填充数据
        "data": temp_data, //  开发状态
        "miniprogram_state": cfg.miniprogram_state, //  语言
        "lang": "zh_CN"
    }

    let emit_type_name = '公众号订阅消息'
    switch (emit_type) {
        case 1:
            //  公众号消息模板
            getUrl = 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + cfg.access_.access_token_official
            emitData.appid = cfg.appid
            emit_type_name = '公众号消息模板'
            if (url) emitData.url = url
            break
        case 2:
            //  小程序
            getUrl = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + cfg.access_.access_token_miniProcedure
            emit_type_name = '小程序订阅消息'
            if (url) emitData.page = url
            break
        default:
            //  公众号订阅消息
            getUrl = 'https://api.weixin.qq.com/cgi-bin/message/subscribe/bizsend?access_token=' + cfg.access_.access_token_official
    }
    //  发送模板消息
    const {data: {errcode, errmsg}} = await ax.post(getUrl, emitData)
    //  查看结果
    if (!errcode) {
        console.log(`发送${emit_type_name}成功。 编号：${temp_id} 说明：${explain}`)
        return {code: 1, msg: 'ok'}
    } else {
        console.log(`发送${emit_type_name}错误\n 原因：${errmsg}\n openid：${openid}\n tempID：${temp_id} \n 类型：${emit_type}\n 说明：${explain}`)
        return {code: 0, msg: errmsg}
    }
}

// 通知抢单 快递
const notice_order_grabbing = async (take, out_trade_no) => {
    console.log('#通知快递抢单中……', take)
    const data = {
        // 客户姓名
        thing4: {value: `${take.user.name}`, color: "#ff0000"}, // 下单时间
        time5: {value: `${formatTime()}`}, // 服务类型
        thing11: {value: '代取快递服务'}, // 服务地址
        thing12: {value: `送至${take.user.numberPlate}`}, // 客户电话
        phone_number10: {value: `${take.user.phoneCode}`}, // 备注
        remark: {value: `${cfg.service_fee.kd_substitute}元`},
    }
    //  挨个通知抢单
    for (const run_openid of qs) {
        //  自身是否处于营业中
        const d_user = await db_query('select * from users_run where openid=?', run_openid)
        if (!d_user.code) return console.log('notice_prepare_receving_order失败，sql查询失败！')
        if (d_user.data.length === 0) return console.log('notice_prepare_receving_order失败，用户不存在')
        const user = d_user.data[0]
        //  处于营业中就发起消息

        user.work_ing && emit_subscribe_msg(run_openid, temp_id.temp_id_order_grabbing, data, 1, `${cfg._address.waiter}#/pages/run/order_detail_kd_substitute?out_trade_no=${out_trade_no}`, '通知商户接单 - 线上点货')
    }
}

// 通知骑手 预备接单
const notice_prepare_receving_order = async (user_info, delivery_position) => {
    console.log('#通知店铺预接单中...')
    const values = {
        // 订单内容：{{keyword1.DATA}}
        keyword1: {value: "取/送 物"}, // 订单金额：{{keyword2.DATA}}
        keyword2: {
            value: service_fee.shop_delivery.toFixed(2)
        }, // 客户信息：{{keyword3.DATA}}
        keyword3: {
            value: user_info
        }, // 送货地址：{{keyword4.DATA}}
        keyword4: {value: delivery_position}, // 客户备注：{{keyword5.DATA}}
        // keyword5: {value: notes}, // {{remark.DATA}}
        // remark: {value: "测试一下尾部消息！！！！"},
    }
    for (run_openid of qs) {
        //  自身是否处于营业中
        const d_user = await db_query('select * from users_run where openid=?', run_openid)
        if (!d_user.code) return console.log('notice_prepare_receving_order失败，sql查询失败！')
        if (d_user.data.length === 0) return console.log('notice_prepare_receving_order失败，用户不存在')
        const user = d_user.data[0]
        //  处于营业中就发起消息
        user.work_ing && emit_subscribe_msg(run_openid, temp_id.notice_shop_new_order, values, 1, `${cfg._address.waiter}#/pages/run/index`, '通知骑手有预订单')
    }
}

// 通知商家 处理订单
const notice_order_business = async (data, out_trade_no) => {
    console.log('#通知商家中处理订单中……')
    // 从里面解析数据
    const {shop_id, goods, address, notes, take_goods_mode, take_goods_code} = data

    // 如果不存在商户id
    if (!shop_id) return console.log('通知商家失败，不存在该id')

    const values = {
        // {{first.DATA}}
        // first: {value: "新订单"},
        // 订单内容：{{keyword1.DATA}}
        keyword1: {value: "线上点餐/物"}, // 订单金额：{{keyword2.DATA}}
        keyword2: {
            value: goods.reduce((amount, item) => {
                //     把每一项的金额 * 数量 再相加 最后取两位小数
                // console.log('----------****----------****')
                // console.log(amount, ' ', item.price, ' ', item.number)
                // console.log('----------****----------****')
                return Number((amount + item.price * item.number)).toFixed(2)
            }, 0)
        }, // 客户信息：{{keyword3.DATA}}

        keyword3: {
            value: take_goods_mode ? `自提码：${take_goods_code}` : address.name + ' ' + address.phoneCode
        }, // 送货地址：{{keyword4.DATA}}
        keyword4: {value: take_goods_mode ? '商户门店[用户自提]' : '宿舍门牌号：' + address.numberPlate}, // 客户备注：{{keyword5.DATA}}
        keyword5: {value: notes}, // {{remark.DATA}}
        // remark: {value: "测试一下尾部消息！！！！"},
    }
    // 通过users_boss 检索shop_id去寻找到boss的openid
    const sql = `SELECT openid FROM users_boss WHERE shop_id = ?`
    const {code: code_user_boss_table, data: data_user_boss_table, err} = await db_query(sql, [shop_id])
    if (!code_user_boss_table) return console.log('通知商家失败，' + err)
    const boss_openid = data_user_boss_table[0].openid
    // 发起模板消息
    emit_subscribe_msg(boss_openid, temp_id.notice_shop_new_order, values, 1, `${cfg._address.waiter}#/pages/boss/order?id=${out_trade_no}`, '通知商家接单')
}

//  返回数据
const sendRes = function (res, data, msg = '访问成功') {
    const info = {
        code: 1, msg, data
    }
    res.send(info)
}

// 返回错误码
const sendErr = function (res, msg = "数据访问失败", data = {}) {
    const info = {
        code: 0, msg, data,
    }
    res.send(info)
}

// 验证token
const verifyToken = function (req, res, next) {
    // 是否处于需要排除的路径 如果是 那就直接跳过
    for (const index in cfg.except_path) {
        if (cfg.except_path[index].test(req.originalUrl)) {
            console.log('遇到排除路径', cfg.except_path[index])
            return next()
        }
    }

    //  获取token
    const token = req.headers.authorization.split(' ')[1];
    // console.log('token', token)
    //  解析token
    jwt.verify(token, cfg.secret_token, (err, decode) => {
        //     错误判定
        if (err) return sendErr(res, 'token校验失败。')
        // 获取openid
        req.openid = decode.openid
        next()
    })
}


// 校验token_但是公众号
const verifyToken_official = function (req, res, next) {
    // 是否处于需要排除的路径 如果是 那就直接跳过
    for (const index in cfg.except_path_official) {
        if (cfg.except_path_official[index].test(req.originalUrl)) {
            console.log('遇到排除路径', cfg.except_path_official[index])
            return next()
        }
    }
    //  获取token
    const token = req.headers.authorization.split(' ')[1];
    //  解析token
    jwt.verify(token, cfg.secret_token, (err, decode) => {
        //     错误判定
        if (err) return sendErr(res, '解码失败！')
        // 获取openid
        req.openid = decode.openid_official
        next()
    })
}


// 格式化时间-补0
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}
// 格式化时间     输出'2008年02月08日 01:01'这种格式的时间
const formatTime = (date = new Date()) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}:${formatNumber(second)}`
}
const create_Iso_time = () => {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

// 封装的数据库查询
const db_query = (sql, params) => {
    return new Promise((resolve, reject) => {
        // 查询
        cfg.db.query(sql, params, (err, data) => {
            // 是否报错
            if (err) return resolve({code: 0, data: err, err: err.sqlMessage})
            // 是否空数据
            if (!data.length) return resolve({code: 0, data, err: '没有任何数据。', eCode: 100})
            resolve({code: 1, data})
        })
    })
}
// 封装的数据库修改
const db_update = (sql, params) => {
    return new Promise(resolve => {
        cfg.db.query(sql, params, (err, result) => {
            //  错误检测
            if (err) return resolve({code: 0, err: err.sqlMessage})
            resolve(result.affectedRows ? {code: 1, data: result} : {code: 0, err: '修改失败'})
        })
    })
}


// 商户把图片存储到本地
const shop_save_img = (imgData, shop_id, time_) => {
    return new Promise(resolve => {
        //     把文件写入到shop_static_file/img下
        const path = __dirname + `/../shop_static_file/img/${time_}.png`
        fs.writeFile(path, imgData, 'binary', function (err) {
            if (err) {
                console.log('商户写入图片遇到错误啦', err)
                return resolve(false)
            }
            console.log('写入成功')
            return resolve(true)
        })
    })
}

const generateRandomString = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

// 生成七位随机数
const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10000000)
}


/*
计算现在到 起始时间 + 期限 还剩下多久
计算时差 需要传入 时间，期限
*/
function computed_time_difference(start_time, term) {
    const now_time = new Date()
    return start_time - now_time + term
}

// 自动结束订单
async function auto_end_order(out_trade_no) {
    console.log('#触发自动倒计时结束订单，订单号:', out_trade_no)
//     查询订单
    console.log('=======')
    const order = await orderSystem.queryOrder(out_trade_no)
    const {code, data} = order
    if (!code) return console.log('@失败，查单失败')
    // 解析data
    const {receving_order_info} = data


    const {auto_end_order_limited_time, delivery_info} = receving_order_info

    // 派送到达时间
    const dispatch_time = new Date(delivery_info.dispatch_time)
    console.log(delivery_info.dispatch_time)
    // 计算时间差
    const residue_time = computed_time_difference(dispatch_time, auto_end_order_limited_time)

    console.log('首次计算，还剩余', residue_time)

    if (residue_time < 0) console.log('@warning：很奇怪，期限是不是太小了呢？', dispatch_time, auto_end_order_limited_time, residue_time)
    setTimeout(async () => {
        const order = await orderSystem.queryOrder(out_trade_no)
        const {code, data} = order
        if (!code) return console.log('@失败，查单失败')
        //     查看状态
        const {order_over, receving_order_info} = data
        const {auto_end_order_limited_time, delivery_info} = receving_order_info
        if (order_over !== 4) return console.log('@warning：订单状态不符合自动结束订单。', order_over)

        // 派送到达时间
        const dispatch_time = new Date(delivery_info.dispatch_time)

        // 计算时间差
        const residue_time = computed_time_difference(dispatch_time, auto_end_order_limited_time)
        console.log('#二次时差', residue_time)
        setTimeout(async () => {
            end_order(out_trade_no)
        }, residue_time)

    }, residue_time)
}

/* 订单结束，给商户修改金额 */
async function end_order(out_trade_no) {
    console.log('#  结束订单', out_trade_no)
    //  订单查询
    const order = await orderSystem.queryOrder(out_trade_no)
    const {code, data} = order
    if (!code) {
        console.log('@失败，最终查单失败')
        return {
            code: 0, msg: "查找不到订单"
        }
    }
    // 解析data
    const {
        order_over, data: {
            goods
        }, receving_order_info
    } = data

    // 是否为4（已完成配送）
    if (order_over !== 4) {
        console.log('@失败，订单状态不符合自动结束订单。')
        return {
            code: 0, msg: order_over === 5 ? '错误，此订单已结单' : '订单状态不符合要求'
        }
    }
    // 更新订单状态为已完成
    const r = await orderSystem.updateOrder(out_trade_no, {
        order_over: 5, time_end_order: `'${formatTime(new Date())}'`
    })
    if (!r.code) {
        console.log('@失败，无法更新订单状态')
        return {
            code: 0, msg: "无法更新订单状态"
        }
    }

    const goods_total = goods.reduce((total, item) => total + item.price * 100 * item.number, 0)

    // 更迭店铺收益
    const shop_ur = await db_update('update shop set sales_volume = sales_volume+?,sales_volume_day = sales_volume_day+?,amount = amount+?,amount_day = amount_day+? where id=?', [1, 1, goods_total / 100, goods_total / 100, receving_order_info.shop_info.shop_id])
    if (!shop_ur.code) {
        console.log('@失败，更新店铺数据失败！', shop_ur.err)
        return {
            code: 0, msg: "更新店铺数据失败"
        }

    }
    // 更迭商人数据
    const merchant_ur = await db_update('update users_boss set reviewAmount = reviewAmount-? , salary = salary+? where openid = ?', [goods_total, goods_total, receving_order_info.shop_info.openid])
    if (!merchant_ur.code) {
        console.log('@失败,更新商人数据失败', merchant_ur.err)
        return {
            code: 0, msg: "更新商人数据失败"
        }
    }
    // 如果是外卖模式，并且不是商家配送 那就 更新骑手数据
    if (data.take_goods_mode && !receving_order_info.shop_info.is_merchant_dispatch) {
        const rider_ur = await db_update('update users_run set reviewAmount = reviewAmount-? , salary = salary+? where openid = ?', [cfg.service_fee.shop_delivery, cfg.service_fee.shop_delivery, receving_order_info.delivery_info.openid])
        if (!rider_ur.code) console.log('@失败，更新骑手数据失败', rider_ur.err)
        return {
            code: 0, msg: "更新骑手数据失败"
        }
    }

    return {
        code: 1, msg: "结单成功~"
    }
    // if (r.code) {
    //     console.log('自动结束订单完成')
    // } else {
    //     console.log('自动结束订单失败')
    // }
}


/*
结束取快递订单
@param out_trade_no 订单号
*/
const end_order_kd_substitute = async (out_trade_no) => {
    console.log('完结取快递订单========')
    //     查询订单
    const order_r = await orderSystem.queryOrder(out_trade_no)
    if (!order_r.code) {
        console.log('订单不存在')
        return {code: 0, msg: "订单不存在"}
    }
    const {order_over, receving_order_info: {openid}} = order_r.data
    if (order_over === 4) {
        console.log('订单已结束。')
        return {code: 0, msg: "订单已结束"}
    }
    //     更新订单状态
    const update_result = await orderSystem.updateOrder(out_trade_no, {
        order_over: 4, time_end_order: `'${formatTime(new Date())}'`
    })
    if (!update_result.code) {
        console.log('错误，无法更新状态')
        return {code: 0, msg: "无法更新状态"}
    }


    // 给骑手加钱
    const sql = 'update users_run set reviewAmount = reviewAmount-?,salary=salary+? where openid=?'
    const add_ur = await db_update(sql, [service_fee.kd_substitute * 100, service_fee.kd_substitute * 100, openid])
    console.log(add_ur.code ? "骑手审核金额通过审核" : "骑手审核金额审核失败")
    return {
        code: 1, msg: "订单已结束。"
    }
}


//  导出
module.exports = {
    end_order_kd_substitute,
    end_order,
    auto_end_order,
    message_tempIds,
    sendRes,
    sendErr,
    emit_subscribe_msg,
    notice_order_grabbing,
    notice_order_business,
    notice_prepare_receving_order,
    verifyToken,
    verifyToken_official,
    formatTime,
    create_Iso_time,
    db_query,
    db_update,
    generateRandomString,
    generateRandomNumber,
    TEMPORORAY_ADDRESS
}