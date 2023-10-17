// 《《超市模式》》

// 接入公共函数
// import {format} from "mysql2";
const path = require('path')
const fs = require("fs");
// 引入multiparty
const multiparty = require('multiparty')


const {
    sendRes,
    sendErr,
    message_tempIds,
    emit_subscribe_msg,
    formatTime,
    db_query,
    db_update,
    generateRandomNumber,
    TEMPORORAY_ADDRESS,
} = require('../function/public.js')


const order = require('../function/order.js')
// ==================================START========================================
//               0未接单，
//               1是已接单（处理中），
//               2 等待配送
//               3 配送中
//               4 配送/自提  订单完毕
// ==================================END========================================
// 商家接单  参数：out_trade_no（订单号）  is_merchant_dispatch（是否商家自送）
const receving_order = async (req, res) => {
    // 获取参数
    const {openid} = req
    // 校验参数
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    // 获取参数
    const {out_trade_no, is_merchant_dispatch} = req.body
    //  订单数据
    const order_result = await order.queryOrder(out_trade_no)
    // 校验订单
    const {code, data} = order_result

    if (!code) return sendErr(res, '订单不存在')
    // 解析data-这里是订单数据
    let {status, order_over, openid: order_db_openid, data: order_data, total} = data

    // 解析order_data
    const {shop_id: data_shop_id, goods: data_goods, take_goods_mode: data_take_goods_mode} = order_data

    // 获取商家信息
    const sql_query_boss = `select * from users_boss where openid = ?`
    const result_boss_info = await db_query(sql_query_boss, [openid])
    if (!result_boss_info.code) return sendErr(res, '接单失败，查询商家信息遇到报错。')
    if (!result_boss_info.data.length) return sendErr(res, '接单失败，服务器查询不到商家信息。')

    // 最终商家信息
    const boss_info = result_boss_info.data[0]
    // 拆解商家信息
    const {shop_id, reviewAmount} = boss_info

    // 根据shop_id查询店铺是否存在
    const sql_query_shop = `select * from shop where id = ?`
    const shop_db = await db_query(sql_query_shop, [shop_id])
    if (!shop_db.code) return sendErr(res, '查询店铺遇到报错。')
    if (!shop_db.data.length) return sendErr(res, '服务器查询不到商家店铺信息。')
    const {id: shop_db_id, title: shop_db_title, phone_number: shop_phone_number} = shop_db.data[0]

    //     比对shop_id
    if (!(data_shop_id === shop_id && shop_id === shop_db_id)) return sendErr(res, '错误，非本店铺订单。')

    //     根据 付款和接单状态 来确定是否能够接单
    if (status == 1 && order_over == 0) {
        // 付款并且未接单

        //  修改接单状态
        const receving_order_info = `'${JSON.stringify({
            shop_info: {
                openid,
                shop_id,
                receving_time: formatTime()
            },
            is_merchant_dispatch
        })}'`
        const update_result = await order.updateOrder(out_trade_no, {order_over: 1, receving_order_info})
        // 判定状态
        if (!update_result.code) return sendErr(res, '接单失败，修改订单重要信息错误。')

        // 增加老板的审核金额
        const sql_add_reviewAmount = `update users_boss set reviewAmount = ? where shop_id = ?`
        const result_update_boss = await db_update(sql_add_reviewAmount, [reviewAmount + total, shop_id])
        const {code, err} = result_update_boss
        if (!code) {
            console.log('增加审核金额失败 回退信息。')
            const update_result = await order.updateOrder(out_trade_no, {
                order_over: 0,
                receving_order_info: null
            })
            if (!update_result.code) console.error('超级大错误,无法回退信息。')

            return sendErr(res, err)
        }

        // 订阅消息-通知用户已接单
        emit_subscribe_msg(order_db_openid, message_tempIds.miniprogram.receving_order, {
            // 接单时间
            // {{time2.DATA}}
            time2: {
                value: formatTime(1)
            },
            // 服务类型
            // {{thing1.DATA}}
            thing1: {value: data_take_goods_mode ? "用户自提" : '配送服务'},
            // 接单员
            // {{thing6.DATA}}
            thing6: {value: `${shop_db_title}`},
            // 接单员电话
            // {{phone_number5.DATA}}
            phone_number5: {value: shop_phone_number},
            // 备注
            // {{thing4.DATA}}
            thing4: {value: '店铺已接单，正在处理中。'},
        }, 2, '17xf.cq.cn', '商户已接单')
        sendRes(res, null, '接单成功。')
    } else {
        // 没付款
        if (status == 0) return sendErr(res, '订单未付款')
        // 非未接单
        else if (order_over !== 0) return sendErr(res, '错误，订单已接单')
        else return sendErr(res, '订单状态异常')
    }

}

// 商家派送（完成）订单 参数：out_trade_no（订单号）   如果是自提模式 那就会直接成为已完成处理完毕。
const dispatch_order = async (req, res) => {
    // 校验参数
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    const {out_trade_no} = params
    if (!out_trade_no) return sendErr(res, '订单号不能为空')
    //  查询订单
    const result_order = await order.queryOrder(out_trade_no)
    const {code, data: dt_order} = result_order
    if (!code) return sendErr(res, '订单查询遇到错误')
    let {openid: openid_, status, data: data_, order_over, receving_order_info, type_name: typeName} = dt_order
    // 解构取货模式
    const {take_goods_mode, take_goods_code, shop_id: order_shop_id} = data_
    // 需要订单状态是已付款并且为已接单
    if (!(status === 1 && order_over === 1)) {
        console.log(dt_order)
        return sendErr(res, '订单状态异常,无法派送订单。')
    }


    // 获取商户信息
    const sql_query_boss = `select * from users_boss where openid = ?`
    const result_boss_info = await db_query(sql_query_boss, [openid])
    if (!result_boss_info.code) return sendErr(res, '接单失败，查询商家信息遇到报错。')
    if (!result_boss_info.data.length) return sendErr(res, '接单失败，服务器查询不到商家信息。')

    // 最终商家信息
    const {shop_id} = result_boss_info.data[0]

    // 根据shop_id查询店铺是否存在
    const sql_query_shop = `select * from shop where id = ?`
    const result_shop_db = await db_query(sql_query_shop, [shop_id])
    if (!result_shop_db.code) return sendErr(res, '查询店铺遇到报错。')
    if (!result_shop_db.data.length) return sendErr(res, '服务器查询不到商家店铺信息。')
    const {
        id: shop_db_id,
        title: shop_db_title,
        phone_number: shop_phone_number,
        address: db_shop_address
    } = result_shop_db.data[0]

    //     比对shop_id
    if (!(order_shop_id === shop_id && shop_id === shop_db_id)) return sendErr(res, '错误，非本店铺订单。')

    // 是否商家自配送
    const {is_merchant_dispatch} = receving_order_info


    // 自提 直接上档   配送模式，需要区分是否是等待、外派  (如果是自提模式 直接成为完单，外送模式-如果是外派 那就变成等待派送，否则派送中)
    order_over = take_goods_mode ? 4 : is_merchant_dispatch ? 3 : 2

    let msg_: string, temp_id: string, values, emit_ = true
    switch (order_over) {
        case 2:
            // 防止发送订阅消息
            emit_ = false
            msg_ = '等待骑手配送'
            break
        case 3:
            msg_ = '商家正在配送'
            // 创建配送信息
            receving_order_info.delivery_info = {
                openid,
                receving_time: formatTime()
            }

            temp_id = message_tempIds.miniprogram.delivery_ing
            values = {
                // 骑手称呼
                // {{thing2.DATA}}
                thing2: {value: `${shop_db_title}`},
                //     骑手电话
                // {{phone_number3.DATA}}
                phone_number3: {value: `${shop_phone_number}`},
                //     订单号
                // {{character_string1.DATA}}
                character_string1: {value: out_trade_no},
                //     订单状态
                // {{phrase5.DATA}}
                phrase5: {value: '商户配送中'}
            }
            break
        case 4:
            msg_ = '通知商户自提'
            temp_id = message_tempIds.miniprogram.delivery_over
            values = {
                // 订单名称
                // {{thing8.DATA}}
                thing8: {value: '自提通知'},
                // thing8: {value: typeName},
                //  订单类型
                // {{thing4.DATA}}
                thing4: {value: dt_order.description},
                //     派送地址
                // {{thing10.DATA}}
                thing10: {value: db_shop_address},
                //     送达时间
                // {{time2.DATA}}
                time2: {value: formatTime(1)},
                //     备注
                // {{thing3.DATA}}
                thing3: {value: `请前往门面自提，自提码[${take_goods_code}]`},
            }
            break
    }

    // 刻录商家派送时间
    receving_order_info.shop_info.dispatch_time = formatTime()
    receving_order_info = `'${JSON.stringify({...receving_order_info})}'`


    //  更新派送。
    const result_update = await order.updateOrder(out_trade_no, {receving_order_info, order_over})

    //   返回结果
    if (!result_update.code) return sendErr(res, '订单更新失败，具体error原因如下：' + result_update.msg)
    // 发送订阅消息 进行微信通知用户

    if (emit_) emit_subscribe_msg(openid_, temp_id, values, 2, '17xf.cq.cn', '通知用户 正处于配送/自提')

    return sendRes(res, null, msg_)

}

// 商户派送完毕
const over_order = async (req, res) => {
    // 校验参数
    const {openid, body: params} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    const {out_trade_no} = params
    if (!out_trade_no) return sendErr(res, '订单号不能为空')
    //  查询订单
    const result_order = await order.queryOrder(out_trade_no)
    const {code, data: dt_order} = result_order
    if (!code) {
        console.log(out_trade_no)
        return sendErr(res, '订单查询遇到错误')
    }

    let {openid: user_openid, status, data: data_, receving_order_info, order_over} = dt_order
    // 需要订单状态是已付款并且为处理中
    if (!(status === 1 && order_over === 3)) return sendErr(res, '订单状态异常,无法确认完成订单。')

    // 结构派送信息
    let {is_merchant_dispatch, delivery_info} = receving_order_info
    if (!is_merchant_dispatch) return sendErr(res, '抱歉，非商家派送订单，你无权确认送达。')

    // 刻录配送时间
    delivery_info.dispatch_time = formatTime()
    //   更新
    receving_order_info = `'${JSON.stringify({...receving_order_info})}'`


    // 派送到达，订单完毕。
    order_over = 4
    const result_update = await order.updateOrder(out_trade_no, {order_over, receving_order_info})
    if (!result_update.code) return sendErr(res, '订单更新失败，具体error原因如下：' + result_update.msg)
    // 发送订阅消息
    const temp_id = message_tempIds.miniprogram.delivery_over
    const values = {
        // 订单名称
        // {{thing8.DATA}}
        thing8: {value: '订单已送达'},
        //  订单类型
        // {{thing4.DATA}}
        thing4: {value: dt_order.description},
        //     派送地址
        // {{thing10.DATA}}
        thing10: {value: data_.address.numberPlate},
        //     送达时间
        // {{time2.DATA}}
        time2: {value: formatTime(1)},
        //     备注
        // {{thing3.DATA}}
        thing3: {value: '订单已送达,请及时确认！(5小时后无操作自动默认送达)'},
    }
    emit_subscribe_msg(user_openid, temp_id, values, 2, '17xf.cq.cn', '通知用户已送达')

    sendRes(res, null, '订单送达完毕。')
}

// 拉取订单  如果传入参数 那就是拉取订单号，如果不传入参数，那就是拉取所有订单
const pull_order = async (req, res) => {
    // 身份校验
    const {openid, body: params} = req
    // 订单号 和是否只获取今日
    const {out_trade_no, is_to_day} = params
    if (out_trade_no) {
        //  有订单号就拉取唯一订单
        const result = await order.queryOrder(out_trade_no)
        const {code, data, msg} = result
        if (!code) return sendErr(res, msg)
        return sendRes(res, data, '拉取订单成功！')
    } else {
        if (!openid) return sendErr(res, '无法校验身份请重新登录')

        // 通过openid查询老板信息
        const sql_query_boss = 'select * from users_boss where openid = ?'
        const result_boss = await db_query(sql_query_boss, openid)
        if (!result_boss.code) return sendErr(res, '查询商户信息错误')

        if (!result_boss.data.length) return sendErr(res, '找不到商户信息')
        const {shop_id} = result_boss.data[0]


        // 查询只要是本店铺的订单。
        // 订单类型范围
        const types = [2, 3]
        // 查询条件就是 符合订单类型的订单、并且 已支付，未处理的订单。最后需要指向我们店铺
        // sql语句，匹配data字段里面的shop_id字段是 ?
        let sql_query = `SELECT * FROM orders WHERE status > 0 and type IN (?) and data ->> '$.shop_id' = ?`

        // 是否只查询今日
        if (is_to_day) {
            sql_query += ' and YEAR(time_pay_order) = YEAR(CURDATE()) AND MONTH(time_pay_order) = MONTH(CURDATE()) AND DAY(time_pay_order) = DAY(CURDATE())'
        }

        const result_order = await db_query(sql_query, [types, shop_id])
        const {code, data, err} = result_order

        if (!code) return sendErr(res, err)
        // 返回订单
        sendRes(res, data, '拉取订单成功！')
    }
}

//  添加商品
const add_goods = async (req, res) => {
    // 身份验证
    const {openid} = req

    // 获取商户信息的sql
    const sql = 'select * from users_boss where openid = ?'
    const result_users_boss = await db_query(sql, [openid])
    if (!result_users_boss.code) return sendErr(res, '身份验证失败！' + result_users_boss.err)

    // 解析表单
    const form = new multiparty.Form({uploadDir: TEMPORORAY_ADDRESS.shop_goods_show, maxFilesSize: 1024 * 1024 * 5})
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
        // 检查表单数据
        // const json = JSON.parse(fields.formInfo[0])
        // const params = JSON.parse(fields.params[0])

        // 参数解析
        const params = JSON.parse(fields.params[0])

        const imgFiles = files

        // 遍历files，查看是否有文件不属于图片类这个范畴 如果有 就打断循环！
        for (let key in imgFiles) if (!imgFiles[key][0].headers['content-type'].includes('image')) return sendErr(res, '错误！请上传图片！')

        // 信息解码
        const {
            urlParams,
            name,
            price,
            inventory,
            not_inventory,
            group,
            tags,
            is_edit_mode,
            edit_goods_index,
            imgs_params,
        } = params

        console.log(params, 'params')

        //  必要信息校验

        if (!is_edit_mode) {
            //  非编辑模式下的图片验证
            const imgFiles_keys = Object.keys(imgFiles)
            if (!imgFiles_keys.length) return sendErr(res, '请至少上传一张图片')
            // 校验分组id、物品id参数是否齐全

            // if (urlParams.group_id == undefined || urlParams.goods_id == undefined) return sendErr(res, '参数不齐全')
            if (urlParams.group_id == undefined) return sendErr(res, '请传入分组id')
        }

        if (!(name && name.length > 1 && name.length < 10)) return sendErr(res, '解析表单错误，error:商品名')
        if (!(price && price > 0.1 && name.length < 99999)) return sendErr(res, '解析表单错误，error:商品价格')
        // 不是无限制库存
        console.log(!not_inventory, (inventory > 1 && inventory < 99999), inventory)

        // if (!not_inventory && (inventory > 1 && inventory < 99999)) return sendErr(res, '解析表单错误，error:商品库存');
        if (!not_inventory && !(inventory > 1 && inventory < 99999)) return sendErr(res, '解析表单错误，error:商品库存');


        if (group === undefined && group < 0) return sendErr(res, '解析表单错误，没有选择分组。')


        // 根据商户id来选择店铺id
        const shop_id = result_users_boss.data[0].shop_id

        const sql_select_shop = 'select * from shop where id = ?'

        const query_shop = await db_query(sql_select_shop, [shop_id])
        const {code, data} = query_shop


        if (!code) return sendErr(res, '错误，匹配店铺失败！' + query_shop.err)
        if (!data.length) return sendErr(res, '无商店配对' + query_shop.err)
        const {goods} = data[0]

        // 需要增加商品的分组
        const add_goods_group = goods[group].goods


        // 模式选择 - 修改模式
        if (is_edit_mode) {
            // 商品
            const goods_ = goods[urlParams.group_id].goods[edit_goods_index]
            !goods_ && sendErr(res, '找不到对应数据！')
            goods_.id !== urlParams.goods_id && sendErr(res, '错误，数据匹配失败！')

            // 修改内容
            goods_.name = name
            goods_.price = price
            goods_.inventory = not_inventory ? 999999 : inventory
            goods_.tags = tags

            goods_.not_inventory = not_inventory
            //  如果有移除的图片
            imgs_params.remove_indexs.length && imgs_params.remove_indexs.forEach(goods_index => {
                // 路径
                const router = goods_.img_address[goods_index]


                // 如果路径为空 那就打断本次循环
                if (!router) return

                // 置空
                goods_.img_address[goods_index] = null

                // 删除文件
                fs.unlink(path.join(__dirname, '..', TEMPORORAY_ADDRESS.shop_goods_show, router.split('/').reverse()[0]), err => {
                    // console.log(path.join(__dirname, '..', TEMPORORAY_ADDRESS.shop_goods_show, file_name))
                    if (err) console.log('重大错误！删除文件失败！')
                })

            })
            //  删除空
            imgs_params.remove_indexs.length && (goods_.img_address = goods_.img_address.filter(item => item));

            //  追加图片地址
            goods_.img_address.push(...Object.keys(imgFiles).map(item => imgFiles[item][0].path.replaceAll('\\', '/')))
            // 如果分组不一样 那就移植分组
            if (group !== urlParams.group_id) {
                // 移植分组
                add_goods_group.push({...goods_})
                // 删除原分组商品
                goods[urlParams.group_id].goods.splice(edit_goods_index, 1)
            }
        } else {
            // 数据增加
            // const {name, price, inventory, not_inventory, group, tags} = json
            add_goods_group.push({
                // 随机id
                id: generateRandomNumber(),
                // 商品名
                name,
                // 下架状态
                isOff: false,
                //  价格
                price,
                // 标签
                tags,
                //  库存
                inventory: not_inventory ? 999999 : inventory,
                // 限量
                not_inventory,
                // 图片路径
                img_address: Object.keys(files).map(item => files[item][0].path.replaceAll('\\', '/')),
                //  月销量
                month_sales: 0
            })
        }


        // 更新数据库
        const sql_update_shop = 'update shop set goods = ? where id = ?'
        const result_update_shop = await db_update(sql_update_shop, [JSON.stringify(goods), shop_id])
        if (!result_update_shop.code) return sendErr(res, '更新数据库失败！' + result_update_shop.err)
        sendRes(res)
    })
}
export default {
    receving_order,
    dispatch_order,
    over_order,
    pull_order,
    add_goods

}
