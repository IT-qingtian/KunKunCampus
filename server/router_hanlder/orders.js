const ax = require('axios')
//  配置项
const cfg = require('../configs')

// 导入公共函数
const {
    sendRes,
    sendErr,
    notice_order_grabbing,
    emit_subscribe_msg,
    message_tempIds,
    formatTime, db_query, db_update
} = require('../function/public')

// 导入订单系统
const system_order = require('../function/order')

//  引入数据库
const {db} = cfg

// 用户支付订单
const orderPay = async (req, res) => {
    const {openid, body: {out_trade_no}} = req
    // 校验openid
    if (!openid) return sendErr(res, '身份校验不通过。')
    // 校验参数
    if (!out_trade_no) return sendErr(res, '参数不存在。')

    //  通过id查询订单 判定订单是否存在
    const sql_query = 'SELECT * FROM orders WHERE out_trade_no = ?'
    db.query(sql_query, [out_trade_no], async (err, result) => {
        // 错误判定
        if (err) return sendErr(res, '查询订单失败。' + err.sqlMessage)
        //  判定结果
        if (!result.length) return sendErr(res, '订单不存在。')
        const order = result[0]

        // 根据订单来判定是否为本人订单
        if (openid !== order.openid) return sendErr(res, '非本人订单，无权支付。')

        //     判定订单支付状态
        if (order.status === 1) {
            // 校验微信服务器
            const result_pay = await cfg.wx_pay.query({
                out_trade_no: order.out_trade_no
            })

            // 微信那边告诉我们订单非已支付
            if (result_pay.trade_state !== "SUCCESS") {

                console.error('疑似用户修改数据库。')

                // 驳回订单支付状态
                return sendErr(res, '异常bug，请联系管理员。#error:a00001')
            }

            // 已支付
            return sendErr(res, '您已支付订单。')

        } else {
            //  没支付，需要生成订单。
            const order_params = system_order.createOrder(order.description, 'http://17xf.cq.cn', order.total, openid)
            // 订单号
            const out_trade_no = order.out_trade_no
            order_params.out_trade_no = out_trade_no
            const payInfo = await cfg.wx_pay.transactions_jsapi(order_params)

            //  如果没有签证成功
            if (!payInfo.paySign) {
                return sendErr(res, '下单失败，微信支付接口错误。' + payInfo.status + payInfo.message)
            }
            payInfo.out_trade_no = out_trade_no

            //  抹除掉status和appid
            delete payInfo.status
            delete payInfo.appId
            // 返回签证信息
            sendRes(res, {payInfo})
        }
    })

}

// 获取订单
const orderGet = async (req, res) => {
    // 解析params
    const {openid, body: {getType}} = req

    // openid校验
    if (!openid) return sendErr(res, '身份校验不通过。')
    // 参数校验
    if (getType === undefined) return sendErr(res, '参数不存在。')

    //     查询数据库
    let sql = `SELECT out_trade_no,type, description, total, data,status as payStatus ,order_over as overStatus  FROM orders WHERE openid = ?`,
        queryValue = []

    // 查询方式
    switch (getType) {
        // 未支付
        case 1:
            sql += ` and status = ?`
            queryValue = [0]
            break
        // 待接单
        case 2:
            sql += ` and status = ? and order_over = ?`
            queryValue = [1, 0]
            break
        //  处理中
        case 3:
            sql += ` and status = ? and order_over = ?`
            queryValue = [1, 1]
            break
        // 已完成
        case 4:
            sql += ` and status = ? and order_over = ?`
            queryValue = [1, 2]
            break
        // 等待评价
        case 5:
            sql += ` and status = ? and order_over = ?`
            queryValue = [1, 3]
    }
    db.query(sql, [openid, ...queryValue], (err, result) => {
        if (err) return sendErr(res, '查询订单失败。' + err.sqlMessage)
        //  返回数据
        sendRes(res, result)
    })

}

// 用户取消订单
const orderCanel = async (req, res) => {
    const {openid, body: {out_trade_no}} = req

    // 校验openid
    if (!openid) return sendErr(res, '身份校验不通过。')
    // 参数校验
    if (!out_trade_no) return sendErr(res, "参数校验不通过")

    const sql_qeury = 'SELECT * FROM orders WHERE out_trade_no = ?'
    db.query(sql_qeury, [out_trade_no], async (err, result) => {
        if (err) return sendErr(res, '取消订单失败' + err.sqlMessage)
        if (!result.length) return sendErr(res, '订单查询失败。')

        if (result[0].order_over >= 2) return sendErr(res, '该订单已经完成，无法取消。')
        // const sql_delete = `DELETE FROM orders WHERE out_trade_no = ?`

        // 更新订单状态为取消
        const sql_cancel = `update orders set order_over = -1 where out_trade_no = ?`

        switch (result[0].status) {
            // 还没付款
            case 0 :
                db.query(sql_cancel, [out_trade_no], async (err, result) => {
                    // 错误判定和订单存在判定
                    if (err) return sendErr(res, '取消订单失败' + err.sqlMessage)

                    if (result.affectedRows !== 1) return sendErr(res, '取消失败。')

                    // 关闭订单
                    const close = await cfg.wx_pay.close(out_trade_no)
                    console.log(close)

                    //  返回数据
                    sendRes(res, {}, '订单取消成功！')
                })
                break
            // 已经付款 需要判定是否接单
            case 1 :
                switch (result[0].order_over) {
                    // 还没人接单
                    case 0:
                        db.query(sql_cancel, [out_trade_no], (err, result) => {
                            if (err) return sendErr(res, '取消订单失败' + err.sqlMessage)
                            console.log('没人接单，可以取消订单。')
                        })
                        break
                    // 已经接单
                    case 1:
                        // 需要让骑手主动取消。
                        sendErr(res, '订单取消失败，派送员已接单，如需取消请联系客服。')
                        // 防止拨款回退。
                        return
                }

                // 退款
                const params = {
                    // 订单号
                    out_trade_no: result[0].out_trade_no,
                    // 退款订单号
                    out_refund_no: result[0].out_trade_no,
                    reason: '用户取消订单',
                    amount: {
                        refund: 1,
                        total: 1,
                        currency: 'CNY',
                    },
                };
                const result_refunds = await cfg.wx_pay.refunds(params);
                // 判定退款情况
                result_refunds.status !== 'PROCESSING' ? console.log('退款失败。', result_refunds) : console.log('退款成功。')


                // 抹杀掉这个订单
                // const {code} = await system_order.deleteOrder(result[0].out_trade_no)
                // if (!code) return sendErr(res, '取消订单失败！')
                sendRes(res, {}, '取消订单成功。')
                break
            default:
                sendErr(res, '取消订单失败，条件错误。')
        }
    })

}

// 用户确认收货
const confirm = async (req, res) => {
    const {openid, body} = req
    // 校验openid
    if (!openid) return sendErr(res, '身份校验不通过。')
//  参数
    const {out_trade_no} = body
    if (!out_trade_no) return sendErr(res, '无订单号，无法查询！')
//  通过订单号查询
    const order = await system_order.queryOrder(out_trade_no)
//     查看是否已经是支付状态 并且处理完毕
    if (!order.code) return sendErr(res, '订单不存在。')
    if (order.data.status !== 1 || order.data.order_over !== 4 || order.data.data.shop_id === undefined) return sendErr(res, '无法处理的订单。')
    // 升级订单状态，并且给商家 增加钱。
    // 找到指定店铺
    const shop_id = order.data.data.shop_id
    // 通过shop_id去找到商家
    // db_query('SELECT * FROM shop WHERE id = ?', [shop_id], async (err, result) => {
    //     if (err) return sendErr(res, '查询商家失败')
    //     if (result.length === 0) return sendErr(res, '店铺不存在')

    //     通过店铺id找到老板
    const boss_ = await db_query('SELECT * FROM users_boss WHERE id = ?', [shop_id])
    if (!boss_.code) return sendErr(res, boss_.err)
    //  给老板名下增加金额 并且减少审核金额
    const boss = boss_.data[0]

    // 修改orders order_over状态
    const o_s = 'UPDATE orders SET order_over = ? WHERE out_trade_no = ?'
    const o_u = await db_update(o_s, [5, out_trade_no])
    //     是否更新
    if (!o_u.code) return sendErr(res, '确认订单失败，这是一个异常的bug-query_1，请联系管理员')

    // 修改boss状态
    const b_s = 'UPDATE users_boss SET reviewAmount = reviewAmount-?, salary = salary+? WHERE id = ?'
    const b_u = await db_update(b_s, [order.data.total, order.data.total, boss.id])
    if (!b_u.code) {
        // 数据回滚
        db_update(o_s, [4, out_trade_no])
        return sendErr(res, '确认订单失败，这是一个异常的bug-query_2，请联系管理员')
    }
    sendRes(res, null, '确认订单成功')
}

//  查询订单
const orderQuery = async (req, res) => {
    const params = req.body
    //  取得订单号 和 订单数据 openid
    const {out_trade_no} = params, {openid} = req
    //  参数校验
    if (!out_trade_no) sendErr(res, '查询失败，无订单参数。')

    if (!openid) sendErr(res, '身份识别错误')

    //  通过订单去查询交易
    const pay_order = await cfg.wx_pay.query({out_trade_no});


    //  如果订单状态为成功
    if (pay_order.status === 200) {
        // 判定order状态
        if (pay_order.trade_state !== "SUCCESS") return sendErr(res, '订单未支付。')

        // 先从数据库里查询订单
        const order = await system_order.queryOrder(out_trade_no)

        // 订单是否合法
        if (!order.code) return sendErr(res, '订单不存在。')


        // 如果订单状态为0 那就更新订单状态  并且通知骑手接单和用户。
        if (order.data.status === 0) {
            const updateOrderResult = await system_order.updateOrder(out_trade_no, {
                status: 1,
                time_pay_order: `'${formatTime(new Date())}'`
            })
            if (!updateOrderResult.code) return sendErr(res, '数据库订单更新失败。可能会导致无法通知骑手接单，请联系管理员！' + updateOrderResult.msg)


            // 订单是否合法
            if (!order.code) return sendErr(res, '重大错误，订单不存在。')
            const {type: order_type, time_create_order, time_pay_order} = order.data

            //  通过openid 告知用户 付款成功。  发送模板消息
            // 订阅消息_ 通知用户付款成功
            try {
                emit_subscribe_msg(order.data.openid, message_tempIds.miniprogram.payOver, {
                    "thing1": {
                        "value": "取快递服务"
                    },
                    "thing3": {
                        "value": JSON.parse(order.data.data).user.name + JSON.parse(order.data.data).user.numberPlate
                    },
                    "time4": {
                        "value": time_create_order
                    },
                    "time6": {
                        "value": time_pay_order
                    }
                }, 2)
            } catch (e) {
                console.log('--------')
                console.log('告知用户付款成功遇到错误', e)
                console.log('--------')
            }

            console.log(order_type)

            // 根据订单类型选择相应处理
            switch (order_type) {
                case 1:
                    //  保留信息 告诉骑手们 这里需要抢单。  第二个参数是订单id
                    notice_order_grabbing(JSON.parse(order.data.data), order.data.id)
                    res.send({
                        code: 1,
                        msg: "交易成功，正在安排骑手为您接单。请留意电话和微信服务通知。"
                    })
                    break;
                default:
                    res.send({
                        code: 0,
                        msg: "未知订单。"
                    })
            }


        } else {
            res.send({
                code: 1,
                msg: "该订单已支付。"
            })
        }
    } else {
        res.send({
            code: 0,
            msg: "请重新查询！，订单状态为：" + pay_order.status
        })
    }
}

// 催促订单
const orderUreg = async (req, res) => {
    const {openid, body} = req
    // 校验openid
    if (!openid) return sendErr(res, '身份校验不通过。')
    //  取得订单号 和 订单数据
    const {out_trade_no} = body
    //  参数校验
    if (!out_trade_no) sendErr(res, '查询失败，无订单参数。')

    // 获取订单数据
    const result_order = await system_order.queryOrder(out_trade_no)
    if (!result_order.code) return sendErr(res, '订单查询错误。')
    const {data: dt_order} = result_order
    //  通过订单去查询交易
    const pay_order = await cfg.wx_pay.query({out_trade_no});
    if (pay_order.status === 200) {
        // 判定order状态
        if (pay_order.trade_state !== "SUCCESS") return sendErr(res, '订单未支付。')

        // 数据库表明是已付款
        if (dt_order.status != 1) return sendErr(res, '该订单不可用。因为不是已付款范畴。')
        // 订单不属于可催单范围
        if (!(dt_order.order_over in yes_ureg)) return sendErr(res, '订单无法催单。')
        // 催单范围，需要根据具体是什么来决定进行通知
        switch (dt_order.order_over) {
            // 请求快速处理
            case 1:
                console.log('催单申请，请求快速处理')
                break
            // 请求快速配送
            case 2:
                console.log('催单申请，请求快速配送')
                break
            // 请求快速送达
            case 3:
                console.log('催单申请，请求快速送达')
                break
        }
        sendRes(res, {}, '催单成功。')
    } else {
        sendErr(res, '订单状态错误')
    }
}
//         1是已接单（处理中），
//         2 等待配送
//         3 配送中
const yes_ureg = [1, 2, 3]

/*接收一个 订单编号 */
const appraise = async (req, res) => {
    const {openid, body} = req
    if (!openid) return sendErr(res, '身份校验不通过。')
    const {out_trade_no} = body
    if (!out_trade_no) return sendErr(res, '订单编号错误。')
//     通过单号查询订单是否存在
    const result = await system_order.queryOrder(out_trade_no)
    if (!result.code) return sendErr(res, '订单不存在！')
//     查看订货是否已完结。
    if (result.data.order_over !== 5) return sendErr(res, '请先确认订单已完成！')
    sendRes(res, '订单评论成功~')
}

module.exports = {
    orderPay, orderGet, orderCanel, confirm, orderQuery, orderUreg, appraise
};