import {sendRes, sendErr, db_query, db_update} from "../../../function/public.js";

//  获取订单
const get_orders = async (req, res) => {
    const {openid, body} = req
    const {out_trade_no, is_my} = body

    //  自身是否处于营业中
    const d_user = await db_query('select * from users_run where openid=?', openid)
    if (!d_user.code) return sendErr(res, '获取用户信息失败' + d_user.err)
    if (d_user.data.length === 0) return sendErr(res, '用户不存在')
    const user = d_user.data[0]
    //  是否处于营业中
    if (!user.work_ing) return sendErr(res, '请先开启工作状态！')

    // 根据自身是否传入订单号来判别
    let sql
    // 是查询自己的订单还是所有订单
    if (is_my) {
        sql = `SELECT *  FROM orders  WHERE JSON_EXTRACT(receving_order_info, '$.delivery_info.openid') = '${openid}';`
    } else {
        sql = `select * from orders where  (order_over=1 or order_over=2)  and status=1`
    }
    if (out_trade_no) sql = `select * from orders where  status=1 and out_trade_no=${out_trade_no}`
    // 订单
    const d_orders = await db_query(sql)
    // 空数据造成错误
    if (d_orders.eCode === 100 && !out_trade_no) return sendRes(res, [], '暂无订单')
    // 是否是指定查询，是指定订单查询那么我们要判断是否由此权限。
    if (out_trade_no) {
        // 空数据
        if (!d_orders.code) return sendErr(res, '查询不到此订单')
        d_orders.data = d_orders.data[0]
        //    订单是否已接单
        console.log(d_orders)
        if (d_orders.data.receving_order_info.delivery_info) {
            //     已接单 验证是否是自己
            return d_orders.data.receving_order_info.delivery_info.openid === openid ? sendRes(res, d_orders.data) : sendErr(res, '非本人接单，无权查看！')
        }
    }
    console.log(sql)
    sendRes(res, d_orders.data)
}


// 导出
module.exports = {get_orders}