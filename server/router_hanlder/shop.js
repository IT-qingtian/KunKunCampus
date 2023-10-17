const {
    db_query,
    sendErr,
    sendRes,
    formatTime,
    create_Iso_time,
    emit_subscribe_msg,
    message_tempIds,
    notice_order_grabbing,
    notice_order_business,

} = require('../function/public')
const {db} = require('../configs')
// 引入订单系统
const system_order = require('../function/order')
const cfg = require("../configs");


// 获取所有商铺列
const getShops = (req, res) => {
    // 拿到openid和参数
    const {openid, body: params} = req
    // 身份校验
    if (!openid) return sendErr(res, '身份校验失败！')
    //     参数校验
    const {id} = params
    // if (id === undefined) return sendErr(res, '参数错误！')

    // 从数据库里取出数据
    let sql_query = `SELECT id,title,tags,start_time,end_time,goods,sales_volume,amount,score,img_address,start_run_price,notice,type FROM shop`
    if (id) sql_query += ' WHERE type = ?'
    db.query(sql_query, [id], (err, result) => {
        //     错误校验
        if (err) return sendErr(res, '数据库查询错误！')
        //     返回数据
        sendRes(res, {result})
    })

}

// 获取指定商铺
const getShop = (req, res) => {
//  拿到参数
    const {openid, body: params} = req
//     校验参数准确性
    if (!openid) return sendErr(res, '身份校验失败！')
    const {id} = params
    if (id === undefined) return sendErr(res, '参数错误！')
//     从数据库里取出数据
    const sql_query = `SELECT * FROM shop WHERE id = ?`
    db.query(sql_query, [id], (err, result) => {
        //     错误校验
        if (err) return sendErr(res, '数据库查询错误！')
        // 判定是否有数据
        if (!result.length) return sendErr(res, '没有找到该商铺！')
        //     返回数据
        sendRes(res, {result: result[0]})
    })
}


// 创建订单 办理签证信息
const createOrder = (req, res) => {
    console.log('----创建商品购物订单')
    //  拿到参数
    const {openid, body: params} = req
    //     校验参数准确性
    if (!openid) return sendErr(res, '身份校验失败！')
    const {
        shop_id, goods: p_goods
    } = params

    //  参数校验
    if (shop_id == null || !p_goods || !p_goods.length) return sendErr(res, '参数错误！') || console.log(params)
    // 获取店铺信息
    const sql_shop = `SELECT * FROM shop WHERE id = ?`
    db.query(sql_shop, [shop_id], async (err, result) => {
        //  错误判定
        if (err) return sendErr(res, '数据库查询错误！')
        //  判定数据是否存在
        if (!result.length) return sendErr(res, '没有找到该商铺！')

        //  获取店铺信息
        const shop = result[0]
        const {goods} = shop

        // 是否有下架商品
        let off_shelf = false

        // 键值表
        const goods_key_values = {}

        // 遍历goods里所有的商品
        const goods_ids_server = []
        goods.forEach(item_class => item_class.goods.forEach(item => {
            const {id} = item
            goods_ids_server.push(id)
            //  加入键值表
            goods_key_values[id] = {...item}
            delete goods_key_values[id].id
        }))

        const goods_ids_user = []

        const total = p_goods.reduce((total, item, index) => {
            const {id, number} = item
            if (!goods_ids_server.includes(id)) {
                console.log('不存在的商品，跳过累加。')
                // 切割掉这个数组
                p_goods.splice(index, 1)
                off_shelf = true
            } else {
                goods_ids_user.push(id)
                // 复制地址
                let price_ = goods_key_values[id].price * number
                // let price_ = Number((goods_key_values[id].price * number).toFixed(2))
                p_goods[index].img_address = goods_key_values[id].img_address
                return total + Number(price_.toFixed(2)) * 100
            }

            //  增加服务费 也是收拾收拾少时诵诗书是撒是撒是撒色
        }, cfg.service_fee.shop * 100 + cfg.service_fee.shop_delivery * 100)


        // console.log('服务', goods_ids_server)
        // console.log('用户', goods_ids_user)
        // console.log('键值表：', goods_key_values)

        const description = '商品购买服务', notify_url = 'http://17xf.cq.cn'

        // 创建订单
        const order_params = system_order.createOrder(description, notify_url, total, openid)

        // 拿到订单号
        const out_trade_no = order_params.out_trade_no


        // 办理签证信息
        const payInfo = await cfg.wx_pay.transactions_jsapi(order_params)

        //  如果没有签证成功
        if (!payInfo.paySign) return sendErr(res, '订单创建失败，微信支付接口错误。')

        // 把订单号写入签证信息
        payInfo.out_trade_no = out_trade_no


        // 根据goods_ids_user 生成订单信息。
        // 写入数据库 含openid，描述，金额，类型，数据，状态，订单号。
        const writeOrder_params = {
            openid,
            description,
            total,
            // 订单类型 3代表购买物品
            type: 3,
            // 订单数据
            data: JSON.stringify({
                // 店铺id
                shop_id,
                // 店铺名
                shop_title: shop.title,
                // 物资
                goods: p_goods,
                // 地址
                address: {},
                // 收货模式
                take_goods_mode: 1,
                // 店铺位置
                shop_position: shop.address,
                //  备注
                notes: '',
                //     服务费
                service_fee: cfg.service_fee.shop,
                //  配送费
                delivery_fee: cfg.service_fee.shop_delivery,
            }), // 0代表未支付
            status: 0, // 订单号
            out_trade_no, // 0代表未接单
            order_over: 0, //  创建订单时间
            // time_create_order: formatTime(new Date())
            time_create_order: formatTime()
        }
        //  入库结果
        const result_push_db = await system_order.writeOrder(writeOrder_params)
        if (!result_push_db.code) return sendErr(res, '下单失败，数据库写入失败。' + result.msg)

        // 入库成功后 注销不需要的信息
        delete payInfo.status
        delete payInfo.appId

        // 两小时后删除订单
        setTimeout(async () => {
            // 先查询订单是否已经支付
            const {code: code_qeury, data: data_query, msg: msg_query} = await system_order.queryOrder(out_trade_no)
            if (!code_qeury) return console.error('::两小时后清理订单失败，查询不到订单\n', msg_query)

            // 查看订单里的status 还是未支付的话就删除订单。
            if (data_query.status) return

            const {
                code: code_delete, data: data_delete, msg: datmsg_delete
            } = await system_order.deleteOrder(out_trade_no)
            if (!code_delete) return console.error('::两小时后清理订单失败，删除订单失败\n', datmsg_delete)
        }, 1000 * 60 * 60 * 2)

        sendRes(res, {
            // 签证信息
            payInfo, // 由于是购买的店铺东西 所以需要返回一些订阅
            subscribeMessageArray: [message_tempIds.miniprogram.receving_order, message_tempIds.miniprogram.delivery_ing, message_tempIds.miniprogram.delivery_over,]
        }, '订单生成成功，请支付')
    })
}
// 修改订单
const change = async (req, res) => {
    const {openid, body: params} = req
    if (openid === undefined) return sendErr(res, '无法校验身份')
    const {out_trade_no} = params
    if (out_trade_no === undefined) return sendErr(res, '订单不存在')
    // 获取订单
    const order_db = await system_order.queryOrder(out_trade_no)
    // 订单是否合法
    if (!order_db.code) return sendErr(res, '订单不存在。')
    let {status, data, total, out_trade_no: out_trade_no_} = order_db.data
    // 非未付款情况
    if (status !== 0) return sendErr(res, '无法修改，该订单非未付款。')

    // 遍历params,然后进行修改
    delete params.out_trade_no

    Object.keys(params).forEach((key) => {
        // 默认数据有这个key值的话
        if (data[key] !== undefined) {
            data[key] = params[key]
        }
    })

    // 根据拿货模式重新定义价格
    total = data.goods.reduce((total, item, index) => {
        return total + item.price * 100 * item.number
    }, cfg.service_fee.shop * 100 + (data.take_goods_mode ? 0 : cfg.service_fee.shop_delivery * 100))
    data = `'${JSON.stringify(data)}'`
    // 更新单号

    out_trade_no_ = system_order.createOrderNumber()
    //     进行修改
    const order_update_result = await system_order.updateOrder(out_trade_no, {data, total, out_trade_no: out_trade_no_})
    order_update_result.code ? sendRes(res, {out_trade_no: out_trade_no_}, '修改成功') : sendErr(res, '修改失败')
}

// 获取订单状态（通过订单号获取订单信息 用于渲染订单页面）
const get_order_status = async (req, res) => {
    //  获取参数
    const {openid, body: params} = req
    //   参数校验
    if (!openid) return sendErr(res, '身份识别错误')
    const {out_trade_no} = params
    if (!out_trade_no) return sendErr(res, '参数错误')

    //  通过订单去查询交易信息
    const sql_qeury_order = 'SELECT * FROM `orders` WHERE `out_trade_no` = ?'
    db.query(sql_qeury_order, [out_trade_no], (err, result) => {
        //     错误校验
        if (err) return sendErr(res, '数据库错误。' + err.message)
        //     订单是否存在
        if (!result.length) return sendErr(res, '订单不存在。')
        //     订单是否属于该用户
        if (result[0].openid !== openid) return sendErr(res, '订单不属于该用户，您无权查看。')

        // 留下非必要信息
        const {data, status, order_over, time_create_order, time_over_order} = result[0]
        const orderInfo = {data, status, order_over, time_create_order, time_over_order}
        // 返回订单数据
        sendRes(res, {orderInfo}, '订单查询成功。')

    })
}

// 查询订单
const order_query = async (req, res) => {
    // 获取参数
    const {openid, body: params} = req

    //  参数校验
    if (!openid) return sendErr(res, '身份识别错误')
    const {out_trade_no, orderInfo} = params
    const {take_goods_mode: of_take_goods_mode} = orderInfo
    if (!orderInfo) return sendErr(res, '参数错误')

    //  通过订单去查询交易
    const pay_order = await cfg.wx_pay.query({out_trade_no});

    //  如果订单状态为成功
    if (pay_order.status === 200) {
        // 判定order状态
        if (pay_order.trade_state !== "SUCCESS") return sendErr(res, '订单未支付。')

        // 先从数据库里查询订单
        const order_first = await system_order.queryOrder(out_trade_no)
        // 订单是否合法
        if (!order_first.code) return sendErr(res, '订单不存在。')

        // 如果订单状态为0 那就更新订单状态  并且通知商家接单。
        if (order_first.data.status === 0) {
            const updataParams = {
                // 已付款。
                status: 1, // 付款日期
                // time_pay_order: `'${formatTime(new Date())}'`,
                time_pay_order: `'${formatTime()}'`, // 增加提货模式
                data: `'${JSON.stringify({
                    ...order_first.data.data, // 提货模式
                    take_goods_mode: of_take_goods_mode, // 提货码
                    take_goods_code: of_take_goods_mode ? Math.random().toString(36).slice(2, 3) + Date.now().toString().slice(-3) : '无提货码'
                })}'`
            }
            const updateOrderResult = await system_order.updateOrder(out_trade_no, updataParams)
            if (!updateOrderResult.code) {
                console.log('遇坑 退款，并且还要关闭这个订单')
                new Promise(async () => {
                    // 关闭订单（已支付无效）
                    // const r = await cfg.wx_pay.close(out_trade_no)
                    //     发起退款
                    const params = {
                        // 订单号
                        out_trade_no: order_first.data.out_trade_no, // 退款订单号
                        out_refund_no: order_first.data.out_trade_no, reason: '更新数据库失败，自动退款。', amount: {
                            refund: order_first.data.total, total: order_first.data.total, currency: 'CNY',
                        },
                    };
                    const result_refunds = await cfg.wx_pay.refunds(params);
                    // 判定退款情况
                    result_refunds.status !== 'PROCESSING' ? console.log('退款失败。', result_refunds) : console.log('退款成功。')
                })
                return sendErr(res, '数据库订单更新失败。可能会无法通知商家，请联系管理员！' + updateOrderResult.msg)
            }
            //  通过openid 告知用户 付款成功。  发送模板消息

            // 根据订单号查询订单 然后获取订单里的 time_create_order和time_pay
            const order = await system_order.queryOrder(out_trade_no)
            // 订单是否合法
            if (!order.code) return sendErr(res, '重大错误，订单不存在。')
            const {time_create_order, time_pay_order} = order.data

            // 告知用户付款成功
            // try {
            //     emit_subscribe_msg(order.data.openid, message_tempIds.miniprogram.payOver, {
            //         "thing1": {
            //             "value": "取快递服务"
            //         }, "thing3": {
            //             "value": 'none'
            //         }, "time4": {
            //             "value": time_create_order
            //         }, "time6": {
            //             "value": time_pay_order
            //         }
            //     }, 2)
            // } catch (e) {
            //     console.log('--------')
            //     console.log('告知用户付款成功遇到错误', e)
            //     console.log('--------')
            // }

            // 保留信息 告诉商家信息。
            notice_order_business(order.data.data, order.data.out_trade_no)

            // 倒计时五分钟 检查是否被接单。
            setTimeout(async () => {
                // 检查本订单是否已经被商家接单 如果已经接单就不用退款了
                const order = await system_order.queryOrder(out_trade_no)
                // 订单是否合法
                if (!order.code) return sendErr(res, '订单不存在。')
                const od = order.data
                // 如果订单数据的 order_over 不为0 那就是已经接单了
                if (od.order_over !== 0) return


                // console.log('坑，需要退回 order_over 状态为 -1！！！')
                // 进行退款
                const updateOrderResult = await system_order.updateOrder(out_trade_no, {order_over: -1})
                if (updateOrderResult.code) {
                    //     发起退款
                    const params = {
                        // 订单号
                        out_trade_no: od.out_trade_no, // 退款订单号
                        out_refund_no: od.out_trade_no, reason: '商家五分钟内未接单，自动退款。', amount: {
                            refund: od.total, total: od.total, currency: 'CNY',
                        },
                    };
                    const result_refunds = await cfg.wx_pay.refunds(params);
                    // 判定退款情况
                    result_refunds.status !== 'PROCESSING' ? console.log('退款失败。', result_refunds) : console.log('退款成功。')
                } else {
                    console.log('修改数据库订单失败，未操作退款！')
                }
            }, 1000 * 60 * 5)

            res.send({
                code: 1, msg: "交易成功，正在通知商家接单，商家五分钟内未接单后会自动退款。"
            })
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

// 测试
module.exports = {
    getShops, getShop, createOrder, order_query, get_order_status, change
}