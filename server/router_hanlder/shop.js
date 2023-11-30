const {
    db_query,
    sendErr,
    sendRes,
    formatTime,
    message_tempIds,
    notice_order_business,
    db_update,
    notice_prepare_receving_order,

} = require('../function/public')
const {db} = require('../configs')
// 引入订单系统
const system_order = require('../function/order')
const cfg = require("../configs");
const order = require("../function/order");


// 获取所有商铺列
const getShops = (req, res) => {
    // 拿到openid和参数
    const {body: params} = req
    //     参数校验
    const {id} = params
    // if (id === undefined) return sendErr(res, '参数错误！')

    // 从数据库里取出数据
    let sql_query = `SELECT id,title,tags,start_time,end_time,trade_time,goods,sales_volume,amount,score,img_address,mdp,notice,comment,type FROM shop`

    // 指定查询
    if (id) {
        sql_query += ' WHERE type = ?'
    } else {
        sql_query += ' WHERE type in (1,2,3)'
    }
    sql_query += ` and JSON_EXTRACT(trade_time,'$[${new Date().getDay()}]') = true and active = 1`
    db.query(sql_query, [id], (err, result) => {
        //     错误校验
        if (err) {
            console.log(err)
            return sendErr(res, '数据库查询错误！')
        }
        //     返回数据
        result.map(item => {
            const {comment} = item
            // 如果没人评论 那默认满分
            if (!comment.length) {
                item.score = 5
            } else {
                // 总分
                const score_ = comment.reduce((pre, cur) => pre + cur.goods_rate ? cur.goods_rate : 0, 0)
                item.score = (score_ / comment.length).toFixed(2)
            }
            delete item.comment
        })
        sendRes(res, {result})
    })

}

// 获取指定商铺
const getShop = async (req, res) => {
//  拿到参数
    const {body: params} = req
    const {id} = params
    if (id === undefined) return sendErr(res, '参数错误！')

//     从数据库里取出数据
    const sql_query = `SELECT * FROM shop WHERE id = ?  and active = 1`
    const shop_r = await db_query(sql_query, [id])
    if (!shop_r.code) {
        return sendErr(res, shop_r.msg)
    }
    const shop_data = shop_r.data[0]

    // 处理goods信息
    shop_data.goods = shop_data.goods.map(group => {
        // 只要有一个不属于下架状态
        const reserve = group.goods.some(item => !item.isOff)
        if (reserve) return group
    }).filter(item => item)

    sendRes(res, {result: shop_data})
    //
    // db.query(sql_query, [id], (err, result) => {
    //     //     错误校验
    //     if (err) return sendErr(res, '数据库查询错误！')
    //     // 判定是否有数据
    //     if (!result.length) return sendErr(res, '没有找到该商铺！')
    //     //     返回数据
    //     sendRes(res, {result: result[0]})
    // })
}


// 创建订单 办理签证信息
const createOrder = (req, res) => {
    console.log('----店铺-购买物品请求 创建订单，办理签证信息----')
    //  拿到参数
    const {openid, body: params} = req

    const {
        // 购买的店铺id
        shop_id,
        // 购买的商品
        goods: p_goods
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
        // const goods_ids_user = []

        const total = p_goods.reduce((total, item, index) => {
            const {id, number} = item
            if (!goods_ids_server.includes(id)) {
                console.log('不存在的商品，跳过累加。')
                // 切割掉这个数组
                p_goods.splice(index, 1)
                off_shelf = true
            } else {
                // goods_ids_user.push(id)
                // 复制地址
                let price_ = goods_key_values[id].price * number
                // let price_ = Number((goods_key_values[id].price * number).toFixed(2))
                p_goods[index].img_address = goods_key_values[id].img_address
                return total + Number(price_.toFixed(2)) * 100
            }

            //  增加服务费
        }, cfg.service_fee.shop * 100 + cfg.service_fee.shop_delivery * 100)

        // console.log('服务', goods_ids_server)
        // console.log('用户', goods_ids_user)
        // console.log('键值表：', goods_key_values)

        const description = '商品购买服务', notify_url = cfg._address.waiter

        // 创建前端支付数据
        const order_params = system_order.createOrder(description, notify_url, total, openid)

        // 拿到订单号
        const out_trade_no = order_params.out_trade_no


        // 写入数据库 含openid，描述，金额，类型，数据，状态，订单号。
        const writeOrder_params = {
            openid, description, total, // 订单类型 3代表购买物品
            type: 3, // 订单数据
            data: JSON.stringify({
                // 店铺id
                shop_id, // 店铺名
                shop_title: shop.title, // 物资
                goods: p_goods, // 地址
                address: {}, // 收货模式（默认null，这个要客户自己来定）
                take_goods_mode: null, // 店铺位置
                shop_position: shop.address, // 店铺电话
                shop_phone: shop.phone_number, //  备注
                notes: '', //     服务费
                service_fee: cfg.service_fee.shop, //  配送费
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
        // delete payInfo.status
        // delete payInfo.appId

        // 指定时间内没支付 那就删除订单。
        setTimeout(async () => {
            // 先查询订单是否已经支付
            const {code: code_qeury, data: data_query, msg: msg_query} = await system_order.queryOrder(out_trade_no)
            if (!code_qeury) return console.error('::规定时间内未付款删除订单--，查询不到订单\n', msg_query)

            // 查看订单里的status 还是未支付的话就删除订单。
            if (data_query.status) return

            const {
                code: code_delete, data: data_delete, msg: datmsg_delete
            } = await system_order.deleteOrder(out_trade_no)
            if (!code_delete) return console.error('::规定时间内未付款删除订单--，删除订单失败\n', datmsg_delete)
            console.log('::规定时间内未付款删除订单--，删除订单成功')
        }, cfg.LIMITED_TIME.shop_unpaid_order)

        sendRes(res, {
            // 签证信息
            // payInfo,
            // 订单单号
            out_trade_no, // 由于是购买的店铺东西 所以需要返回一些订阅
            subscribeMessageArray: [message_tempIds.miniprogram.receving_order, message_tempIds.miniprogram.delivery_ing, message_tempIds.miniprogram.delivery_over,]
        }, '订单生成成功，请尽快支付！以免订单自动取消。')
    })
}


// 修改订单
const change = async (req, res) => {
    const {body: params} = req
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
    total = data.goods.reduce((total, item) => {
        return total + item.price * 100 * item.number
    }, cfg.service_fee.shop * 100 + (data.take_goods_mode ? 0 : cfg.service_fee.shop_delivery * 100))
    data = `'${JSON.stringify(data)}'`
    // 更新单号

    out_trade_no_ = system_order.createOrderNumber()
    //     进行修改
    const order_update_result = await system_order.updateOrder(out_trade_no, {
        data, total, out_trade_no: out_trade_no_
    })
    order_update_result.code ? sendRes(res, {out_trade_no: out_trade_no_}, '修改成功') : sendErr(res, '修改失败')
}

// 请求支付
const res_pay = async (req, res) => {
    /*
              out_trade_no: this.orderInfo.out_trade_no,
          // 配送模式
          take_goods_mode: this.orderInfo.take_goods_mode,
          // 地址
          address: this.orderInfo.address,
          // 备注
          notes: this.orderInfo.notes
    * */
    let {out_trade_no, take_goods_mode, address, notes} = req.body

//     参数校验
    if (!out_trade_no) return sendErr(res, '错误，未携带订单号。')
    // 自提模式时
    if (!take_goods_mode) {
        // 参数检测
        const keys = ['name', 'numberPlate', 'phoneCode']
        keys.forEach((key) => {
            if (!address[key]) return sendErr(res, `错误，未携带${key}。`)
        })
    }
    // !notes && (notes = '')


//     查看订单状态
    const order_r = await system_order.queryOrder(out_trade_no)
    if (!order_r.code) return sendErr(res, order_r.msg)

    const {
        status, order_over, description, data
    } = order_r.data

    if (!(status === 0 && order_over === 0)) return sendErr(res, '订单支付状态已过期~')

    // 计算价格
    let total = data.goods.reduce((count, item) => count + item.price * 100 * item.number, 0)

    // 服务费
    total += cfg.service_fee.shop * 100

    if (!take_goods_mode) total += cfg.service_fee.shop_delivery * 100  //配送费


    //  生成支付参数
    const order_params = system_order.createOrder(description, `${cfg._address.waiter}`, total, req.openid)


    const payInfo = await cfg.wx_pay.transactions_jsapi(order_params)

    if (!payInfo.paySign) {
        console.log('============')
        console.log(payInfo)
        console.log('============')
        return sendErr(res, '下单失败，微信支付接口错误。')
    }

    delete payInfo.status
    delete payInfo.appId

    // 修改订单的 取货方式和 支付订单号、total
    const r = await system_order.updateOrder(out_trade_no, {
        data: `JSON_SET(data, "
        $.take_goods_mode", ${take_goods_mode},
        "$.address", cast('${JSON.stringify(address)}' as json),
        '$.pay_out_trade_no', ${order_params.out_trade_no},
        '$.notes','${notes}')`, total,
    })

    if (!r.code) return sendErr(res, r.msg)

    sendRes(res, {
        order_params, payInfo
    })
}

// 获取订单状态（通过订单号获取订单信息 用于渲染订单页面）
const get_order_status = async (req, res) => {
    //  获取参数
    const {openid, body: params} = req

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

    const {out_trade_no} = params

    if (!out_trade_no) return sendErr(res, '参数错误')

    const order_r = await system_order.queryOrder(out_trade_no)
    if (!order_r.code) return sendErr(res, order_r.msg)

    const {
        openid: openid_, data: {
            pay_out_trade_no, take_goods_mode,
        }, status
    } = order_r.data

    if (openid !== openid_) return sendErr(res, '订单不属于该用户，您无权查看。')


    //  通过订单去查询交易
    const pay_order = await cfg.wx_pay.query({out_trade_no: pay_out_trade_no});

    //  如果订单状态为成功
    if (pay_order.status === 200) {
        // 判定order状态
        if (pay_order.trade_state !== "SUCCESS") return sendErr(res, '订单未支付。')

        // 如果订单状态为0 那就更新订单状态  并且通知商家接单。
        if (status === 0) {
            const {data: {shop_position, shop_id, goods, address: user_address}} = order_r.data

            // 店铺
            const r_shop = await db_query('select * from shop where id = ?', [shop_id])
            if (!r_shop.code) return sendErr(res, '获取店铺信息失败。')
            const {auto_receving_openid: boss_openid, title: shop_title} = r_shop.data[0]

            // 非自动接单
            if (!boss_openid) {

                const take_goods_code = take_goods_mode ? Math.random().toString(36).slice(2, 3) + Date.now().toString().slice(-3) : '无提货码'

                const updataParams = {
                    // 已付款。
                    status: 1, // 付款时间
                    time_pay_order: `'${formatTime()}'`, // 增加提货模式
                    data: `JSON_SET(data,'$.take_goods_code','${take_goods_code}')`,
                }
                const updateOrderResult = await system_order.updateOrder(out_trade_no, updataParams)

                order_r.data.data.take_goods_mode = take_goods_mode
                order_r.data.data.take_goods_code = take_goods_code
                if (!updateOrderResult.code) {
                    console.log('error 普通店铺 查询订单失败，原因：数据库更新操作失败。')
                    new Promise(async () => {
                        // 关闭订单（已支付无效）
                        // const r = await cfg.wx_pay.close(out_trade_no)
                        //     发起退款
                        const params = {
                            // 订单号
                            out_trade_no: pay_out_trade_no + '', // 退款订单号
                            out_refund_no: pay_out_trade_no + '', reason: '更新数据库失败，自动退款。', amount: {
                                refund: order_r.data.total, total: order_r.data.total, currency: 'CNY',
                            },
                        };
                        const result_refunds = await cfg.wx_pay.refunds(params);

                        // 判定退款情况
                        result_refunds.status !== 'PROCESSING' ? console.log('error：退款失败。', result_refunds) : console.log('退款成功。')

                        const del_r = await system_order.deleteOrder(out_trade_no)
                        console.log(del_r.code ? "删除订单成功。" : "删除订单失败。")
                    })
                    return sendErr(res, '下单失败，请联系管理员！' + updateOrderResult.msg)
                }
                //  通过openid 告知用户 付款成功。  发送模板消息

                // 保留信息 告诉商家信息。
                notice_order_business(order_r.data.data, out_trade_no)

                // 付款成功后 倒计时 检查是否被接单。
                setTimeout(async () => {
                    // 检查本订单是否已经被商家接单 如果已经接单就不用退款了
                    const order = await system_order.queryOrder(out_trade_no)
                    // 订单是否合法
                    if (!order.code) return sendErr(res, '订单不存在。')
                    const od = order.data
                    // 如果订单数据的 order_over 不为0 那就是已经接单了
                    if (od.order_over !== 0) return


                    // 进行退款
                    const updateOrderResult = await system_order.updateOrder(out_trade_no, {order_over: -1})
                    if (updateOrderResult.code) {
                        //     发起退款
                        const params = {
                            // 订单号
                            out_trade_no: pay_out_trade_no + '', // 退款订单号
                            out_refund_no: pay_out_trade_no + '', reason: '商家接单超时，自动退款。', amount: {
                                refund: od.total, total: od.total, currency: 'CNY',
                            },
                        };
                        const result_refunds = await cfg.wx_pay.refunds(params);
                        // 判定退款情况
                        result_refunds.status !== 'PROCESSING' ? console.log('退款失败。', result_refunds) : console.log('退款成功。')
                    } else {
                        console.log('修改数据库订单失败，未操作退款！')
                    }
                }, cfg.LIMITED_TIME.shop_order_timeout)

                res.send({
                    code: 1,
                    msg: `交易成功，正在通知商家接单，商家约${(cfg.LIMITED_TIME.shop_order_timeout / 60 / 1000).toFixed(2)}分钟内未接单后会自动退款。`
                })
            } else {

                //     更新订单信息
                const updataParams = {
                    // 已付款。
                    status: 1,
                    // 等待配送状态
                    order_over: 2,
                    // 付款日期
                    time_pay_order: `'${formatTime()}'`, // 增加提货模式

                    data: `'${JSON.stringify({
                        ...order_r.data.data, // 提货模式
                        take_goods_mode: 0, // 提货码
                        take_goods_code: '无提货码'
                    })}'`, receving_order_info: `'${JSON.stringify({
                        // 接单信息
                        "shop_info": {
                            // 接单人openid
                            "openid": boss_openid, "shop_id": shop_id,
                            // 接单时间
                            "receving_time": formatTime(),
                            // 处理时间
                            "dispatch_time": formatTime()
                        },
                        // 忘记是干啥的了
                        "is_later_auto": false,
                        // 完成后  自动结束订单时间延时
                        auto_end_order_limited_time: cfg.LIMITED_TIME.shop_unpaid_order,
                    })}'`
                }
                const updateOrderResult = await system_order.updateOrder(out_trade_no, updataParams)// 更新订单

                // 如果写入数据库失败 那就退款。
                if (!updateOrderResult.code) {
                    // 更新订单为退款
                    const order_refund_r = await system_order.updateOrder(out_trade_no, {order_over: -1})
                    if (!order_refund_r.code) {
                        return sendErr(res, '更新数据库失败，退回操作失败，请联系工作人员！！！')
                    }

                    //     发起退款
                    const params = {
                        // 订单号
                        out_trade_no: pay_out_trade_no + "", // 退款订单号
                        out_refund_no: pay_out_trade_no + "", reason: '更新数据库失败，自动退款。', amount: {
                            refund: order_r.data.total, total: order_r.data.total, currency: 'CNY',
                        },
                    };
                    const result_refunds = await cfg.wx_pay.refunds(params);

                    // 判定退款情况
                    if (result_refunds.status !== 'PROCESSING') {
                        console.log('error：重大错误，订单已取消，但退款失败。')
                        return sendErr(res, '退款失败，请联系工作人员！')
                    } else {
                        return sendErr(res, '遇到异常！无法更新订单，已退款。')
                    }
                }

                // 增加老板的审核金额
                const sql_add_reviewAmount = `update users_boss set reviewAmount = reviewAmount + ? where openid = ?`


                // 商品钱（老板应得的）
                const goods_total = goods.reduce((total, item) => total += item.price * 100 * item.number, 0)

                const result_update_boss = await db_update(sql_add_reviewAmount, [goods_total, boss_openid])
                const {code} = result_update_boss

                if (!code) {
                    console.log('error：重大错误，用户购买店铺物品  给老板增加审核金额失败。')

                    // 退款
                    new Promise(async () => {
                        //     更新订单为退款
                        const order_refund_r = await system_order.updateOrder(out_trade_no, {order_over: -1})
                        if (!order_refund_r.code) {
                            console.log('error：重大错误，更新订单退款操作都失败了')
                            return sendErr(res, '更新数据库失败，并且无法正常退款，请联系工作人员！！！')
                        }

                        //     发起退款
                        const params = {
                            // 订单号
                            out_trade_no: pay_out_trade_no + "", // 退款订单号
                            out_refund_no: pay_out_trade_no + "", reason: '更新数据库失败，自动退款。', amount: {
                                refund: order_r.data.total, total: order_r.data.total, currency: 'CNY',
                            },
                        };
                        const result_refunds = await cfg.wx_pay.refunds(params);
                        // 判定退款情况

                        // 判定退款情况
                        if (result_refunds.status !== 'PROCESSING') {
                            console.log('error：重大错误，订单已取消，但退款失败。')
                            return sendErr(res, '退款失败，请联系工作人员！')
                        } else {
                            return sendErr(res, '遇到异常！无法更新订单，已退款。')
                        }

                        return sendErr(res, '下单失败，请联系管理员。')
                    })

                    return sendErr(res, '下单失败，无法更新店家收益。')
                }

                console.log('店铺自动接单成功，通知骑手 接单ing。')

                notice_prepare_receving_order(shop_title + '(委托方)', `${user_address.numberPlate}宿舍`)

                //  订单倒计时  如果店家没接单那就自动取消订单。
                setTimeout(async () => {
                    // 检查本订单是否已经被商家接单 如果已经接单就不用退款了
                    const order = await system_order.queryOrder(out_trade_no)
                    // 订单是否存在
                    if (!order.code) return

                    const od = order.data

                    // 不是未接单状态  那就不管了
                    if (od.order_over !== 0) return

                    // 进行退款
                    const updateOrderResult = await system_order.updateOrder(out_trade_no, {order_over: -1})

                    if (updateOrderResult.code) {
                        //     发起退款
                        const params = {
                            // 订单号
                            out_trade_no: pay_out_trade_no + "", // 退款订单号
                            out_refund_no: pay_out_trade_no + "", reason: '商家规定时间内未接单，自动退款。', amount: {
                                refund: od.total, total: od.total, currency: 'CNY',
                            },
                        };
                        const result_refunds = await cfg.wx_pay.refunds(params);
                        // 判定退款情况
                        result_refunds.status !== 'PROCESSING' ? console.log('退款失败。', result_refunds) : console.log('退款成功。')
                    } else {
                        console.log('error：重大错误 修改数据库订单失败，未操作退款！')
                    }
                }, cfg.LIMITED_TIME.shop_order_timeout)

                res.send({
                    code: 1,
                    msg: `交易成功，商家约${(cfg.LIMITED_TIME.shop_order_timeout / 60 / 1000).toFixed(2)}分钟内未接单后会自动退款。`
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
// 测试
module.exports = {
    getShops, getShop, createOrder, order_query, get_order_status, change, res_pay
}