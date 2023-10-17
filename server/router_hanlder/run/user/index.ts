import {sendRes, sendErr, db_query, db_update} from "../../../function/public.js";

//  修改工作状态
const change_work_status = async (req, res) => {
    const {openid, body} = req
    const {is_work_ing} = body
// 开始修改
    const sql = `update users_run set work_ing=${is_work_ing} where openid='${openid}'`
    const result = await db_update(sql)
    if (!result.code) return sendErr(res, '修改失败啦' + result.err)
    sendRes(res, {is_work_ing})
}
// 导出
module.exports = {change_work_status}