const {
    sendErr,
    sendRes,
    message_tempIds,
    emit_subscribe_msg,
    formatTime,
    db_update,
    end_order_kd_substitute, db_query
} = require('../function/public')
const {db} = require('../configs')
const order = require("../function/order");
const {
    service_fee,
    LIMITED_TIME
} = require('../configs')
const cfg = require("../configs");

// 检查是否是自己 需要传入订单信息，和openid   他会根据订单信息里面的 receving_order_info 并且解析出来的openid来判定是否是自己的openid是否相同
const checkSelf = (order_result, openid) => {
    // 判定是否是自己的单
    if (JSON.parse(order_result.receving_order_info).openid !== openid) return false
    return true
}

// 查询所有快递单子
const showKdOrder = async (req, res) => {
    //  定义sql语句 查询 已付款 并且还没接单的 快递单。
    const sql = `select * from orders where status = 1 and order_over = 0`
    db.query(sql, (err, result) => {
        // 错误判定
        if (err) return sendErr(res, err.sqlMessage)
        // 返回信息
        sendRes(res, {
            result
        }, '获取成功')
    })
}

// 通过_id来获取订单
const showKdOrderOne = async (req, res) => {
    // 判定openid
    const {openid, body: {id}} = req
    if (!openid) return sendErr(res, 'openid不存在')
    // 判定参数
    if (!id) return sendErr(res, 'id参数错误')

    // 定义sql语句
    const sql = `select * from orders where id = ? and order_over = 0`
    db.query(sql, [id], (err, result) => {
        console.log(err, result)
        //     错误校验
        if (err) return sendErr(res, err.sqlMessage)
        //  判定结果
        if (result.length === 0) return sendErr(res, '订单不存在，可能已经被人家抢走啦。')
        sendRes(res, {result: result[0]}, '获取成功')
    })
}

// 确认抢单
const grabbing = async (req, res) => {
    //     校验openid
    const {openid, body: {out_trade_no}} = req

    // 判定参数
    if (!out_trade_no) return sendErr(res, '订单号参数错误')

    // 订单查询
    const order_r = await order.queryOrder(out_trade_no)
    if (!order_r.code) return sendErr(res, '订单查询失败。')
    // 解析订单
    const {openid: client_openid} = order_r.data

    // 获取自身
    const run_r = await db_query('select * from users_run where openid = ?', [openid])
    if (!run_r.code) return sendErr(res, '无法查询到您的信息。')

    const currentTime = formatTime()

    // 刻录接单人信息
    const data = {
        auto_end_order_limited_time: cfg.LIMITED_TIME.auto_end_order,
        //     接单时间
        receving_time: currentTime,
        // 取件时间
        take_time: currentTime,
        //     接单人id
        openid
    }
    // 变更订单为接单
    // 定义sql语句  接单，并且
    const sql = `update orders set order_over = 1,receving_order_info = ? where out_trade_no = ? and order_over = 0`

    db.query(sql, [JSON.stringify(data), out_trade_no], (err, result) => {
        //     错误判定
        if (err) return sendErr(res, err.sqlMessage)
        //     判定结果
        if (result.affectedRows === 0) return sendErr(res, '订单不存在，可能已经被人家抢走啦。')

        // 告知用户已接单
        emit_subscribe_msg(client_openid, message_tempIds.miniprogram.receving_order, {
            // 接单时间
            // {{time2.DATA}}
            time2: {
                value: currentTime
            },
            // 服务类型
            // {{thing1.DATA}}
            thing1: {value: '快递代取'},
            // 接单员
            // {{thing6.DATA}}
            thing6: {value: run_r.data[0].name},
            // 接单员电话
            // {{phone_number5.DATA}}
            phone_number5: {value: run_r.data[0].phone_number},
            // 备注
            // {{thing4.DATA}}
            thing4: {value: '已有代取员接单，正在为您取件配送中……'},
        }, 2, 'http://www.baidu.com', '通知用户已有快递代取员接单。')

        //     返回信息
        sendRes(res, {}, '接单成功 请按照规则处理订单。')
    })
}

// 取消订单
const cancel = async (req, res) => {
    //     校验openid
    const {openid, body: {id}} = req
    if (!openid) return sendErr(res, 'openid不存在')
    // 判定参数
    if (!id) return sendErr(res, 'id参数错误')

    //   用订单id验证身份   order_over = 1 是已接的单
    const sql = `select * from orders where id = ?`
    db.query(sql, [id], (err, result) => {
        //     错误校验
        if (err) return sendErr(res, err.sqlMessage)
        //  判定结果
        if (!result.length) return sendErr(res, '无此订单。')
        //  根据订单参数来判定是否为本人接单
        const {order_over} = result[0]

        // 判定是否是自己的单
        if (!checkSelf(result[0], openid)) return sendErr(res, '您不是接单人，无权取消订单。')

        //     判定订单状态
        switch (order_over) {
            case 0:
                return sendErr(res, '订单尚未领取。')
            case 1:
                // 已接单状态 现在需要改变成 未接单状态
                const sql = `update orders set order_over = 0 where id = ?`
                return db.query(sql, [id], (err, result) => {
                    //     错误判定
                    if (err) return sendErr(res, err.sqlMessage)
                    //     判定结果
                    if (!result.affectedRows) return sendErr(res, '取消订单失败，未知状况！')
                    return sendRes(res, null, '订单取消成功。')
                })
            case 2:
                return sendErr(res, '订单已完成 无需取消订单。')
            default:
                return sendErr(res, '订单状态未知！')
        }
    })


}


// 更新订单状态
const update_state = async (req, res) => {
    const {openid, body: {out_trade_no}} = req
    if (!out_trade_no) return sendErr(res, '订单号参数错误')

    //  订单数据
    const order_result = await order.queryOrder(out_trade_no)
    if (!order_result.code) return sendErr(res, '订单不存在')

    let {openid: user_openid, receving_order_info, order_over, data} = order_result.data
    // 判定是否是自己的订单
    if (receving_order_info.openid !== openid) return sendErr(res, '不支持操作他人的订单。')

    // 自身信息
    const run_r = await db_query('select * from users_run where openid = ?', [openid])
    if (!run_r.code) return sendErr(res, '无法查询到您的信息。')


    // 是否在操作范围内
    if (!(order_over >= 1 && order_over <= 2)) return sendErr(res, '超出权限范围。')

    const currentTime = formatTime()
    const obj = {
        key: '',
        // 操作时间
        value: currentTime
    }
    switch (order_over) {
        case 1:
            // 运送
            obj.key = 'transport_time'
            // 取件中
            break
        case 2:
            // 送达
            obj.key = 'delivery_time'
            // 正在配送
            break
    }

    order_over++

    //     更新订单状态
    const sql = `update orders set order_over = ?, receving_order_info = JSON_SET(receving_order_info, '$.${obj.key}','${obj.value}') where out_trade_no = ?`
    db.query(sql, [order_over, out_trade_no], async (err, result) => {
        //     错误判定
        if (err) return sendErr(res, err.sqlMessage)
        //     判定结果
        if (!result.affectedRows) return sendErr(res, '更新订单状态失败，未知状况！')

        switch (order_over) {
            case 2://
                // 正在配送
                break
            case 3://
                // 已送到到

                const sql = 'update users_run set reviewAmount = reviewAmount+? where openid=?'
                // 更新骑手审核金额
                const ur_ = await db_update(sql, [service_fee.kd_substitute * 100, openid])
                if (!ur_.code) {
                    console.log('更新金额失败', ur_.msg)
                    return sendErr(res, '更新订单状态失败，未知状况！')
                }
                //  自动结束订单
                setTimeout(() => {
                    end_order_kd_substitute(out_trade_no)
                }, LIMITED_TIME.kd_order_over)

                //  告知用户 订单已完成
                emit_subscribe_msg(user_openid, message_tempIds.miniprogram.kd_substitute_over, {
                    //         订单名称
                    // {{thing8.DATA}}
                    thing8: {value: "代取快递"},
                    //     订单类型
                    // {{thing4.DATA}}
                    thing4: {value: "代取业务"},
                    //     派送地址
                    thing10: {value: data.user.numberPlate},
                    //     送达时间
                    time2: {value: currentTime},
                    //     备注
                    thing3: {value: `${data.code.shelf_number}-${data.code.layer_number}-${data.code.number}`}
                }, 2, '', '用于通知用户 快递已送达')
                break
            default:
                return sendErr(res, '状态无效！')
        }

        sendRes(res, null, '更新成功。')
    })
}

// 完成订单
const overOrder = async (req, res) => {
// 校验openid
    const {openid, body: {id}} = req
    if (!openid) return sendErr(res, 'openid不存在')
    // 判定参数
    if (!id) return sendErr(res, 'id参数错误')

    //  用订单id验证身份   order_over = 1 是已接的单
    const sql = `select * from orders where id = ? and order_over = 1`

    db.query(sql, [id], (err, order_result) => {
        //    错误判定
        if (err) return sendErr(res, err.sqlMessage)
        //    判定结果
        if (!order_result.length) return sendErr(res, '订单不存在，无法确认完成订单。')


        // 判定是否是自己的单
        if (!checkSelf(order_result[0], openid)) return sendErr(res, '不是本人接的单哦。')

        // 有订单，现在修改订单的over_order值为2
        const sql = `update orders set order_over = 2 where id = ?`
        db.query(sql, [id], (err, result) => {
            //     错误判定
            if (err) return sendErr(res, err.sqlMessage)
            //     判定结果
            if (!result.affectedRows) return sendErr(res, '订单确认失败，未知状况！')


            // 完成订单，增加 审核金额
            const sql = `update users_run set reviewAmount = reviewAmount + ? where openid = ?`
            db.query(sql, [order_result[0].total, openid], (err, result) => {
                //  错误校验
                if (err) return sendErr(res, err.sqlMessage)
                //  判定结果
                if (!result.affectedRows) {
                    // 退回操作
                    const sql_back_orderOver = `update orders set order_over = 1 where id = ?`
                    db.query(sql_back_orderOver, [id])
                    return sendErr(res, '结单失败，增加审核金额错误，请重试 如果经常失败，请联系管理员！' + id)
                }


                // 通知骑手和用户订单完成。

                const time = formatTime(new Date)


                //  告知用户 订单已完成
                emit_subscribe_msg(order_result[0].openid, message_tempIds.miniprogram.over, {
                    // 送达时间
                    time2: {
                        value: time,
                        color: '#ff0000'
                    },
                    // 订单类型
                    thing4: {value: order_result[0].description},
                    // 备注
                    thing3: {
                        // value: JSON.parse(order_result[0].data).remarks
                        value: '如未收到包裹，请点击本消息进行投诉！',
                        color: '#ff0000'
                    },
                    // 派送地址
                    thing10: {value: JSON.parse(order_result[0].data).user.numberPlate},
                    // 包裹单号
                    character_string9: {value: JSON.parse(order_result[0].data).code},
                }, 2, 'http://www.baidu.com')


                // 告知骑手 订单送达。
                emit_subscribe_msg(openid, message_tempIds.official.over, {
                    first: {
                        "value": "已确认完成订单",
                    },
                    keyword1: {
                        value: '+' + order_result[0].total / 100 + '元（审核金额）',
                        color: "#00ff3b"
                    },
                    keyword2: {
                        value: order_result[0].description
                    },
                    keyword3: {
                        value: '张三'
                    },
                    keyword4: {
                        value: "派单时间"
                    },
                    keyword5: {
                        value: "完成时间"
                    },
                    remark: {
                        value: "这里是备注消息"
                    }
                }, 1)


                return sendRes(res, null, '订单确认成功，已增加审核金额。')
            })
        })

    })

}

//  导出
module.exports = {
    grabbing,
    cancel,
    showKdOrder,
    showKdOrderOne,
    overOrder,
    update_state
}