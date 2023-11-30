const ax = require('axios')
//  配置项
const cfg = require('../configs')
const path = require('path')
const multiparty = require('multiparty')
// 导入公共函数
const {
    sendRes,
    sendErr,
    notice_order_grabbing,
    emit_subscribe_msg,
    message_tempIds,
    formatTime,
    db_query,
    db_update,
    end_order,
    TEMPORORAY_ADDRESS
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
    let sql = `SELECT out_trade_no,type, description, total, data,status as payStatus,time_pay_order,order_over as overStatus ,receving_order_info,appraise FROM orders WHERE openid = ?`,
        queryValue = []
    /*
    * status                支付状态
    * order_over        订单状态
    * */
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
            sql += ` and status = ? and`
            sql += '('
            sql += '(type = ? and order_over = ?)'
            sql += 'or'
            sql += '(type =? and order_over in (?,?))'
            sql += ')'
            queryValue = [1, 3, 1, 1, 2, 3]
            break
        // 已完成
        case 4:
            sql += ` and status = ? and`
            sql += '('
            sql += '(type = 3 and order_over in (3,4))'  //快递服务
            sql += 'or'
            sql += '(type = 1 and order_over in (4,5))'  //送物服务
            sql += ')'
            queryValue = [1]
            break
        // 等待评价
        case 5:
            sql += ` and status = ? and`
            sql += '('
            sql += '(type = 3 and order_over = 4)'  //快递服务
            sql += 'or'
            sql += '(type = 1 and order_over = 5)'  //送物服务
            sql += ')'
            queryValue = [1]
    }
    db.query(sql, [openid, ...queryValue], (err, result) => {
        if (err) return sendErr(res, '查询订单失败。' + err.sqlMessage)
        //  返回数据
        sendRes(res, result)
    })

}

/*
退款并删订单
@params
order_out_trade_no：订单号（用于修改订单状态）
pay_out _trade_no：付款订单号（用于退款操作）
total：退款金额（单位：分）
reason：退款原因
*/
const orderRefund = async (order_out_trade_no, pay_out_trade_no, total, reason = '用户取消订单') => {
    console.log(`申请退款订单号：${pay_out_trade_no} 申请退款金额：${total}分`)
    // 退款
    const params = {
        // 订单号
        out_trade_no: `${pay_out_trade_no}`, // 退款订单号
        out_refund_no: `${pay_out_trade_no}`,
        reason,
        amount: {
            refund: total, total, currency: 'CNY',
        },
    };

    const result_refunds = await cfg.wx_pay.refunds(params);


    // 判定退款情况
    if (result_refunds.status !== 'PROCESSING') {

        // 如果是已退款
        if (result_refunds.status === 'SUCCESS') {
            await system_order.updateOrder(order_out_trade_no, {status: -1})
            return {
                code: 1, msg: "已退款，取消订单成功。"
            }
        }

        console.log('退款失败。', result_refunds)
        return {
            code: 0, msg: "退款失败，无法取消订单。"
        }
    }

    // 修改订单为自动退款
    const r = await system_order.updateOrder(order_out_trade_no, {status: -1})

    if (!r.code) {
        console.log('error：已退款，但删除订单失败,重大错误。')
    }


    return {
        code: 1, msg: "已退款，取消订单成功。"
    }

}

// 用户取消订单
const orderCanel = async (req, res) => {
    const {body: {out_trade_no}} = req
    // 参数校验
    if (!out_trade_no) return sendErr(res, "参数校验不通过")

    const sql_qeury = 'SELECT * FROM orders WHERE out_trade_no = ?'

    db.query(sql_qeury, [out_trade_no], async (err, result) => {
        if (err) return sendErr(res, '取消订单失败' + err.sqlMessage)
        if (!result.length) return sendErr(res, '订单查询失败。')
        if (result[0].order_over >= 2) return sendErr(res, '该订单已经完成，无法取消。')
        const order = result[0]

        switch (order.status) {
            // 还没付款
            case 0 :
                const r = await orderRefund(out_trade_no, order.data.pay_out_trade_no, order.total)
                res.send(r)
                break
            // 已经付款 需要判定是否接单
            case 1 :
                switch (order.order_over) {
                    // 还没人接单
                    case 0:
                        // 关闭支付接口，并且删掉订单。
                        const r = await orderRefund(out_trade_no, order.data.pay_out_trade_no, order.total)
                        res.send(r)
                        break
                    // 已经接单
                    default:
                        // 需要让骑手主动取消。
                        sendErr(res, '订单取消失败，已接单。')
                }
                break
            default:
                sendErr(res, '取消订单失败，条件错误。')
        }
    })

}

// 用户确认收货
const confirm = async (req, res) => {
    const {body: {out_trade_no}} = req

    if (!out_trade_no) return sendErr(res, '无订单号，无法查询！')
    const r = await end_order(out_trade_no)
    res.send(r)
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
                status: 1, time_pay_order: `'${formatTime(new Date())}'`
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
                    }, "thing3": {
                        "value": JSON.parse(order.data.data).user.name + JSON.parse(order.data.data).user.numberPlate
                    }, "time4": {
                        "value": time_create_order
                    }, "time6": {
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
                    notice_order_grabbing(JSON.parse(order.data.data), order.data.out_trade_no)
                    res.send({
                        code: 1, msg: "交易成功，正在安排骑手为您接单。请留意电话和微信服务通知。"
                    })
                    break;
                default:
                    res.send({
                        code: 0, msg: "未知订单。"
                    })
            }


        } else {
            res.send({
                code: 1, msg: "该订单已支付。"
            })
        }
    } else {
        res.send({
            code: 0, msg: "请重新查询！，订单状态为：" + pay_order.status
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
    const {openid} = req.// 解析
        const
    form = new multiparty.Form({uploadDir: TEMPORORAY_ADDRESS.appraise, maxFilesSize: 1024 * 1024 * 5})

    form.parse(req, async (err, fields, files) => {
        if (err) {
            const {code} = err
            switch (code) {
                case 'ETOOBIG':
                    return sendErr(res, '错误！图片超过最大尺寸。')
                default :
                    return sendErr(res, '未知上传错误！')
            }
        }
        // 格式化 fields
        for (const key in fields) {
            fields[key] = fields[key][0]
        }

        console.log(fields, files)

        if (!fields.out_trade_no) return sendErr(res, '订单号不存在。')
        if (fields.appraise_content === undefined) return sendErr(res, '无效的评论。')

        // 检测是否存在订单
        //  通过单号查询订单是否存在

        const result = await system_order.queryOrder(fields.out_trade_no)
        if (!result.code) return sendErr(res, '订单不存在！')
        const {
            openid: openid_
        } = result.data
        // 是否本人订单
        if (openid !== openid_) return sendErr(res, '非本人订单 无法评论。')

        // 获取用户恓
        const user_r = await db_query('select * from users where openid =?', [openid])
        if (!user_r.code) return sendErr(res, '用户不存在！')
        const {
            name: name_r
        } = user_r.data


        //  查看订货是否已完结。
        if (result.data.order_over !== 5) return sendErr(res, '请先确认订单已完成！')
        // 订单是否已评论
        if (result.data.appraise) return sendErr(res, '评论失败，此订单已评论。')

        // 是否存在图片
        let img_path

        if (files.file) {
            const file = files.file[0]
            // 后缀
            const ext = path.extname(file.path)
            // 路径
            const dirname = path.dirname(file.path)

            img_path = path.join(dirname, fields.out_trade_no + '_' + (Math.random() * 10000).toFixed(0) + ext)
            fs.rename(path.join(__dirname, '..', file.path), img_path, err => {
                if (err) console.log('图片重命名失败,11000')
            })
        }

        // 时间
        const dt = new Date()
        const appraise_time = `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 ${dt.getHours()}:${dt.getMinutes()}`

        //  修改自身评论内容 并且给商家报备评价
        const json = {
            // 内容
            content: fields.appraise_content, // 是否匿名
            is_anonymous: fields.is_anonymous, // 图片路径
            img: img_path?.replace(path.join(__dirname, '..'), ''), // 评论时间
            appraise_time, // 物品 星级
            goods_rate: fields.goods_rate, // 配送 星级
            delivery_rate: fields.delivery_rate,
        }

        const sql = 'update orders set appraise = ? where out_trade_no = ?'
        const r = await db_update(sql, [JSON.stringify(json), fields.out_trade_no])
        if (!r.code) return sendErr(res, '评论失败，刻录数据库无效。ecode:16516')

        // 给店铺增加评论
        // 获取店铺
        const result_shop = await db_query(`select * from shop where id = '${result.data.data.shop_id}'`)
        if (!result_shop.code) {
            //     数据回滚 清空
            db_update(sql, [null, fields.out_trade_no])
            return sendErr(res, '评论失败，无法找到店铺！')
        }
        // 获取评论
        const {comment} = result_shop.data[0]

        const is_anonymous = fields.is_anonymous
        // 增加评论
        comment.push({
            // 点赞数
            like_user: [], // 是否匿名
            is_anonymous, // 评论时间
            appraise_time, //  头像
            head_img: is_anonymous ? TEMPORORAY_ADDRESS.head_img_anonymous : "", //  名称

            name: is_anonymous ? "匿名用户" : name_r, //  评论内容

            content: fields.appraise_content, //  带图地址
            img: img_path?.replace(path.join(__dirname, '..'), ''), //  追回内容
            children: [], // 商品星级
            goods_rate: fields.goods_rate, // 配送星级
            delivery_rate: fields.delivery_rate,
        })
        // 更新到数据库
        const u_s = await db_update(`update shop set comment = ? where id = ?`, [JSON.stringify(comment), `${result.data.data.shop_id}`])
        if (!u_s.code) {
            //     数据回滚 清空
            db_update(sql, [null, fields.out_trade_no])
            return sendErr(res, '评论失败，数据库刻录数据无效！')
        }
        sendRes(res, '发表评论成功！')

    })
}

module.exports = {
    orderPay, orderGet, orderCanel, confirm, orderQuery, orderUreg, appraise
};