import {
    db_query,
    db_update,
    sendErr,
    sendRes,
    message_tempIds,
    emit_subscribe_msg,
    formatTime,
    auto_end_order
} from '../function/public'

import {db} from '../configs'
// 引入订单系统
const cfg = require('../configs.js')
const order = require('../function/order.js')

// 骑手接单
const receving = async (req, res) => {
    const {openid, body: params} = req
    // if (!openid) return sendErr(res, '无法校验身份请重新登录')
    const {out_trade_no} = params

    //  订单数据
    const order_result = await order.queryOrder(out_trade_no)
    if (!order_result.code) return sendErr(res, '订单不存在')

    // 解析 订单类型、订单付款状态，当前状态，接单信息   思路-确定是超市类型，并且已付款 当前只是被商家接单，非自提
    let {data: {type, status, order_over, data, receving_order_info}} = order_result


    // 无法接单原因
    {
        if (type !== 3) return sendErr(res, '订单类型不符合。')
        if (status !== 1) return sendErr(res, '本订单付款信息错误。')
        if (![1, 2].includes(order_over)) return sendErr(res, '接单失败，商家尚未接单或订单已完成。')
        if (data.take_goods_mode !== 0) return sendErr(res, '接单失败，非外派模式。')
        if (receving_order_info.is_merchant_dispatch) return sendErr(res, '接单失败，本订单为商家自配送。')
        if (receving_order_info.delivery_info) return sendErr(res, '接单失败，你来晚了，本订单已被别人接到了。')
    }

    // 变更接单信息
    {
        receving_order_info.delivery_info = {
            openid,
            start_receving_time: formatTime(new Date())
        }
        receving_order_info = `'${JSON.stringify(receving_order_info)}'`
    }
    //  刻录进数据库
    const update_result = await order.updateOrder(out_trade_no, {receving_order_info})
    if (!update_result.code) return sendErr(res, '接单失败')
    // 给自身增加配送费
    const rider_ur = await db_update(`update users_run set reviewAmount = reviewAmount + ? where openid = ?`, [cfg.service_fee.shop_delivery * 100, openid])
    if (!rider_ur.code) console.log('@error 骑手接单错误，本订单已接单，但未增加审核金额')

    sendRes(res, null, '接单成功')
}

// 修改配送状态
const change_delivery_state = async (req, res) => {
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    const {out_trade_no} = params

    //  订单数据
    const order_result = await order.queryOrder(out_trade_no)

    if (!order_result.code) return sendErr(res, '订单不存在')

    // 解析 订单类型、订单付款状态，当前状态，接单信息   思路 确定类型、已付款、外派模式、是本人接单、商家处理好了
    let {
        data: {
            type,
            status,
            order_over,
            data,
            receving_order_info,
            openid: openid_client,
            type_name: typeName,
            description
        }
    } = order_result
    // 解析data
    const {address: db_order_address} = data

    // 公共错误
    {
        if (type !== 3) return sendErr(res, '配送失败，订单类型不符合。')
        if (data.take_goods_mode !== 0) return sendErr(res, '修改配送状态失败，非外派模式。')
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
        if (![1, 2, 3].includes(order_over)) return sendErr(res, '修改配送状态失败，商家尚未接单或订单已完成。')
        // 外派模式
        if (receving_order_info.is_merchant_dispatch) return sendErr(res, '修改配送状态失败，本订单为商家自配送。')
        // 处于 已 接单状态 需要识别身份。
        if ((order_over in [2, 3])) {
            // 识别身份
            // console.log(receving_order_info.delivery_info)
            if (receving_order_info.delivery_info === undefined) return sendErr(res, '修改配送状态失败，本订单未被接单。')
            if (!(receving_order_info.delivery_info && receving_order_info.delivery_info.openid === openid)) return sendErr(res, '修改配送状态，非本人接单。')
        }

    }

    // 获取自身
    const sql_query_run = `select * from users_run where openid = ?`
    const result_run_info = await db_query(sql_query_run, [openid])
    if (!result_run_info.code) return sendErr(res, '查询骑手信息遇到报错。')
    if (!result_run_info.data.length) return sendErr(res, '服务器查询不到骑手信息。')

    // 最终骑手信息
    const {name: db_run_name, phone_number: db_run_phone_number} = result_run_info.data[0]


    let state_msg: string, temp_id: string, values
    // 根据目前状态来
    switch (order_over) {
        case 1:
            return sendErr(res, '请先等待商家出单...')
        case 4:
            return sendErr(res, '无法操作状态，订单已完成。')
        //  处理完毕，未开始配送
        case 2:
            // 商家已处理完毕，开始配送。
            order_over = 3
            state_msg = '订单已开始配送'
            receving_order_info.delivery_info.receving_time = formatTime(new Date())
            // 下派通知告诉用户
            temp_id = message_tempIds.miniprogram.delivery_ing
            values = {
                // 骑手称呼
                // {{thing2.DATA}}
                thing2: {value: `${db_run_name}`},
                //     骑手电话
                // {{phone_number3.DATA}}
                phone_number3: {value: `${db_run_phone_number}`},
                //     订单号
                // {{character_string1.DATA}}
                character_string1: {value: out_trade_no},
                //     订单状态
                // {{phrase5.DATA}}
                phrase5: {value: '骑手配送中'}
            }
            break
        // 未知错误
        case 3:
            // 当前处于正在配送阶段，确认完成配送。
            //  配送过程中，配送完毕。
            order_over = 4
            auto_end_order(out_trade_no)
            state_msg = '订单已配送完成'
            // 刻录骑手派送时间
            receving_order_info.delivery_info.dispatch_time = formatTime(new Date())
            // 下派通知告诉用户
            temp_id = message_tempIds.miniprogram.delivery_over
            values = {
                // 订单名称
                // {{thing8.DATA}}
                // thing8: {value: typeName},
                thing8: {value: '订单已送达'},
                //  订单类型
                // {{thing4.DATA}}
                thing4: {value: description},
                //     派送地址
                // {{thing10.DATA}}
                thing10: {value: db_order_address.numberPlate},
                //     送达时间
                // {{time2.DATA}}
                time2: {value: formatTime(new Date())},
                //     备注
                // {{thing3.DATA}}
                thing3: {value: '订单已送达,请及时确认！'},
            }
            break
        default:
            return sendErr(res, '修改配送状态失败，属【状态】错误。')
    }
    emit_subscribe_msg(openid_client, temp_id, values, 2)

    receving_order_info = `'${JSON.stringify(receving_order_info)}'`

    // 更新数据 刻录进数据库
    const update_result = await order.updateOrder(out_trade_no, {order_over, receving_order_info})
    if (!update_result.code) return sendErr(res, '修改配送状态失败！error：' + update_result.msg)
    sendRes(res, null, '修改配送状态成功，' + state_msg)
}
//  导出
module.exports = {
    receving,
    change_delivery_state
}