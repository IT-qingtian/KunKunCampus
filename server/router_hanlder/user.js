//  引入jwt
const jwt = require("jsonwebtoken");
// 引入配置文件
const cfg = require('../configs')
// 引入公共函数
const {sendRes, sendErr} = require('../function/public')
// 数据库
const db = cfg.db

// 获取用户地址
const user_address = (req, res) => {
    // header里面解析token
    const token = req.headers.authorization.split(' ')[1];
    // 解析token 获取openid
    jwt.verify(token, cfg.secret_token, async (err, decode) => {
        //     错误判定
        if (err) return sendErr(res, '解析openid失败')
        // 获取openid
        const openid = decode.openid
        // 从users_address表里取出用户的地址
        const sql = `select id,numberPlate,name,sex,phoneCode from users_address where openid = ? ORDER BY id`
        db.query(sql, [openid], async (err, result) => {
            //    错误判定
            if (err) return sendErr(res, '地址查询失败：' + err.sqlMessage)
            // 判断是否有地址
            if (!result.length) return sendErr(res, '还没有地址。')
            sendRes(res, {
                address: result
            }, '访问地址成功')
        })
    })

}
// 添加用户地址 需要传入 numberPlate, name, phoneCode, sex
const user_add_address = (req, res) => {
//     解析params
    const params = req.body
    const {numberPlate, name, phoneCode, sex} = params

    //     校验params里参数是否包含上面几个
    if (!(numberPlate && name && phoneCode && sex)) return sendErr(res, '参数缺失。')
    //     校验token
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, cfg.secret_token, async (err, decode) => {
        //     错误判定
        if (err) return sendErr(res, '解析openid失败')
        // 获取openid
        const openid = decode.openid
        // openid、numberPlate、name、phoneCode、sex 插入到地址数据库
        const sql = `INSERT INTO users_address (openid,numberPlate,name,phoneCode,sex) VALUES (?,?,?,?,?)`
        db.query(sql, [openid, numberPlate, name, phoneCode, sex], async (err, result) => {
            //     错误判定
            if (err) return sendErr(res, '添加地址失败：' + err.sqlMessage)
            //     判断是否添加成功
            if (result.affectedRows === 1) {
                sendRes(res, null, '添加成功。')
            } else {
                //     报错
                sendErr(res, '添加失败。')
            }
        })
    })
}
// 删除用户地址
const user_delete_address = (req, res) => {
//   解析参数
    const params = req.body
//     获取参数
    const {id} = params
//     判定id是否存在
    if (!id) return sendErr(res, '无参数')
// 解析token
    const token = req.headers.authorization.split(' ')[1]
//     通过token获取openid
    jwt.verify(token, cfg.secret_token, (err, decode) => {
        //     错误判定
        if (err) return sendErr(res, 'openid获取失败')
        // 获取openid
        const openid = decode.openid
        // 使用 id来删除 符合openid下的记录
        const sql = `DELETE FROM users_address WHERE id = ? AND openid = ?`
        db.query(sql, [id, openid], (err, result) => {
            //     错误判定
            if (err) return sendErr(res, '删除失败：' + err.sqlMessage)
            //     判断是否删除成功
            if (result.affectedRows === 1) {
                sendRes(res, null, '删除成功。')
            } else {
                sendErr(res, '删除失败。')
            }
        })
    })
}
// 修改用户地址
const user_update_address = (req, res) => {
//     解析参数
    const params = req.body
//     获取参数
    const {id, op} = params
    if (!(id && op)) return sendErr(res, '参数不整齐')
// 解析token
    const token = req.headers.authorization.split(' ')[1]
//     通过token获取openid
    jwt.verify(token, cfg.secret_token, (err, decode) => {
//     错误判定
        if (err) return sendErr(res, 'openid获取失败')
// 获取openid
        const openid = decode.openid
        // 使用id来更新符合openid下的记录
        // const sql = `UPDATE users_address SET ? WHERE id = ? AND openid = ?`
        //  op里是否有id 如果有id就删除
        if (op.id) delete op.id
        let data = ``
        // op转数组 然后遍历
        Object.keys(op).forEach(key => {
            const item = op[key]
            // 拼接data
            data += `${key} = '${item}',`
        })
        // 切除最后一个逗号
        data = data.slice(0, -1)
        // console.log(`// UPDATE users_address SET ${data} WHERE id = ${id} AND openid = '${openid}'`)
        db.query(`UPDATE users_address SET ${data} WHERE id = ${id} AND openid = '${openid}'`, (err, result) => {
            //     错误判定
            if (err) return sendErr(res, '修改失败：' + err.sqlMessage)
            //     判断是否修改成功
            if (result.affectedRows === 1) {
                sendRes(res, null, '修改成功。')
            } else {
                sendErr(res, '修改失败。')
            }
        })
    })


}

// 选择默认地址
const select_default_address = (req, res) => {
    //     解析参数
    const params = req.body
    //     获取参数
    const {id} = params

    if (id === undefined) return sendErr(res, '参数不整齐')
    // 解析token
    const token = req.headers.authorization.split(' ')[1]

    //  通过token获取openid
    jwt.verify(token, cfg.secret_token, (err, decode) => {
//     错误判定
        if (err) return sendErr(res, 'openid获取失败')
// 获取openid
        const openid = decode.openid

        // 从数据库 按照openid 并且 以id来排序 找到第一个的数据的id值
        const sql = `SELECT id FROM users_address ORDER BY id ASC LIMIT 1`
        db.query(sql, [openid], (err, result) => {
                //    错误判定
                if (err) return sendErr(res, '查询失败：' + err.sqlMessage)
                //    判断是否查询成功
                if (!result.length) return sendErr(res, '错误，用户还没有任何地址')
                // 取的第一个id
                const OneId = result[0].id - 1
                // 限定，不能让已经是第一个
                if (OneId + 1 == id) return sendErr(res, '已经是默认地址了。')

                // 把传过来的id 替换成 oneid之前
                const sql = `UPDATE users_address SET id = ? WHERE id = ? AND openid = ?`
                db.query(sql, [OneId, id, openid], (err, result) => {
                    //     错误判定
                    if (err) return sendErr(res, '修改失败：' + err.sqlMessage)
                    //   判断是否修改成功
                    if (!result.affectedRows) return sendErr(res, '修改失败,无数据被替换。')
                    sendRes(res, {
                        id: OneId
                    }, '修改成功。')
                })
            }
        )
    })
}

module.exports = {user_address, user_add_address, user_delete_address, user_update_address, select_default_address}