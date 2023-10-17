const ax = require('axios')
//  配置项
const cfg = require('../configs')

// 引入订单系统
const system_order = require('../function/order')

// 导入公共函数
const {
    sendRes,
    sendErr,
    notice_order_grabbing,
    emit_subscribe_msg,
    message_tempIds,
    formatTime
} = require('../function/public')

const jwt = require("jsonwebtoken");
//  引入数据库
const {db} = cfg

//  取快递-请求支付。
const takePay = async (req, res) => {
    // 解析openid 解析body数据
    const {openid, body: {take}} = req
    if (!openid) return sendErr(res, '身份验证不通过。')
    // 获取日期
    const
        description = '帮取快递服务',
        notify_url = 'http://17xf.cq.cn',
        total = 1

    //  使用订单系统生成订单参数
    const order_params = system_order.createOrder(description, notify_url, 1, openid)

    // 拿到订单号
    const out_trade_no = order_params.out_trade_no

    // 签证信息
    const payInfo = await cfg.wx_pay.transactions_jsapi(order_params)

    //  如果没有签证成功
    if (!payInfo.paySign) return sendErr(res, '下单失败，微信支付接口错误。')
    payInfo.out_trade_no = out_trade_no

    // 写入数据库 含openid，描述，金额，类型，数据，状态，订单号。
    const writeOrder_params = {
        openid,
        description,
        total,
        // 订单类型 1代表帮取快递
        type: 1,
        // 订单数据
        data: JSON.stringify(take),
        // 0代表未支付
        status: 0,
        // 订单号
        out_trade_no,
        // 0代表未抢单
        order_over: 0,
        //  创建订单时间
        time_create_order: formatTime(new Date())
    }
    //  入库结果
    const result = await system_order.writeOrder(writeOrder_params)
    //  根据结果返回信息
    if (!result.code) return sendErr(res, '下单失败，数据库写入失败。' + result.msg)
    //  抹除掉status和appid
    delete payInfo.status
    delete payInfo.appId

    // 两小时后删除订单
    setTimeout(async () => {
        // 先查询订单是否已经支付
        const {code: code_qeury, data: data_query, msg: msg_query} = await system_order.queryOrder(out_trade_no)
        if (!code_qeury) return console.error('::两小时后清理订单失败，查询不到订单\n', msg_query)

        // 查看订单里的status 还是未支付的话就删除订单。
        if (data_query.status) return

        const {code: code_delete, data: data_delete, msg: datmsg_delete} = await system_order.deleteOrder(out_trade_no)
        if (!code_delete) return console.error('::两小时后清理订单失败，删除订单失败\n', datmsg_delete)
    }, 1000 * 60 * 60 * 2)

    sendRes(res, {payInfo}, '订单生成成功，请支付')
};

//  查询订单
const order_query = async (req, res) => {
    const params = req.body
    //  取得订单号 和 订单数据 openid
    const {out_trade_no, take} = params, {openid} = req
    //  参数校验
    if (!out_trade_no || !take) sendErr(res, '查询失败，无订单参数。')

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
            //  通过openid 告知用户 付款成功。  发送模板消息

            // 根据订单号查询订单 然后获取订单里的 time_create_order和time_pay
            const order = await system_order.queryOrder(out_trade_no)
            // 订单是否合法
            if (!order.code) return sendErr(res, '重大错误，订单不存在。')
            const {time_create_order, time_pay_order} = order.data

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

            //  保留信息 告诉骑手们 这里需要抢单。  第二个参数是订单id
            notice_order_grabbing(take, order.data.id)

            res.send({
                code: 1,
                msg: "交易成功，正在安排骑手为您接单。请留意电话和微信服务通知。"
            })
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

//  用户修改住宿地址
const user_update_address = async (req, res) => {
    const params = req.body
    const {address} = params
    // 把解析出来的address存入数据库
    //  判定address是否存在
    if (!address) return sendErr(res, '地址不存在。')
    const token = req.headers.authorization.split(' ')[1];
    // 解析token 获取openid
    jwt.verify(token, cfg.secret_token, async (err, decode) => {
            //  处理token
            if (err) return sendErr(res, '解析openid失败')
            // 获取openid
            const openid = decode.openid
            // 查询用户是否存在
            const sql = `select * from users where openid = '${openid}'`
            db.query(sql, async (err, result) => {
                if (err) return sendErr(res, '用户查询失败。')
                // 判断用户是否存在
                if (result.length === 0) {
                    return sendErr(res, '用户不存在。')
                }
                //   用户存在后，更新用户信息
                //  address转字符串
                const address_ = JSON.stringify(address)

                const sql = `update users set address = ${address_} where openid = '${openid}'`

                db.query(sql, (err, result) => {
                    console.log(sql, '---', err.sqlMessage, result)
                    if (err) return sendErr(res, '修改失败。' + err.sqlMessage)

                    // 判断是否修改成功
                    if (result.affectedRows === 1) {
                        sendRes(res, '修改成功。')
                    } else {
                        sendErr(res, '修改失败。')
                    }
                })
            })


        }
    )

}

//  添加地址
const user_add_address = async (req, res) => {
    //     解析params
    const params = req.body
    const {address} = params
    // 把解析出来的address存入数据库
    //  判定address是否存在
    if (!address) return sendErr(res, '你尚未填写地址。')
    const token = req.headers.authorization.split(' ')[1];
    // 解析token 获取openid
    jwt.verify(token, cfg.secret_token, async (err, decode) => {
        //     处理token
        if (err) return sendErr(res, '解析openid失败')
        // 获取openid
        const openid = decode.openid
        // 查询用户是否存在
        const sql = `select * from users where openid = '${openid}'`
        db.query(sql, async (err, result) => {
            //     错误判定
            if (err) {
                console.log('查询用户失败', err.sqlMessage)
                return sendErr(res, '查询用户失败。' + err.sqlMessage)
            }
            // 判断用户是否存在
            if (!result.length) return sendErr(res, '用户不存在。')
            // 存储地址进users_address表
            const sql = `insert into users_address (openid, numberPlate,name,phoneCode,sex) values ('${openid}',?,?,?,?)`
            db.query(sql, [address.numberPlate, address.name, address.phoneCode, 1], (err, result) => {
                // 错误判定
                if (err) {
                    console.log('添加地址失败', err.sqlMessage)
                    return sendErr(res, '添加地址失败。' + err.sqlMessage)
                }
                // 判断是否添加成功
                if (result.affectedRows === 1) {
                    sendRes(res, '添加成功。')
                }
            })
        })
    })
}

module.exports = {
    // 支付
    takePay,
    // 查询订单
    order_query,
    //   更新地址
    user_update_address,
    //  添加地址
    user_add_address
};
