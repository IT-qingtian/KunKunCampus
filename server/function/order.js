//  从配置区引入数据库
const cfg = require('../configs')
// console.log(db, 3)
// 订单系统
const system_order = {
    // 返回订单号字符串
    createOrderNumber: function () {
        return String(new Date().getTime())
    },

    // 生成订单 需要你填入订单描述，回调地址，金额，用户openid   以及创建订单时需要写入数据库的参数
    createOrder: function (description, notify_url, total, openid) {
        //  生成订单号
        const out_trade_no = this.createOrderNumber()
        //  生成订单参数 用于前端微信支付
        const order_info = {
            description,
            out_trade_no,
            notify_url,
            amount: {
                //  金额
                total,
            },
            payer: {
                openid,
            },
            scene_info: {
                payer_client_ip: 'ip',
            },
        };

        return order_info
    },

    //  写入数据库 含openid，描述，金额，类型，数据，状态，订单号。
    writeOrder: function (params) {
        return new Promise((resolve, reject) => {
            // 解析出params里的东西
            const {openid, description, total, type, data, status, out_trade_no, order_over, time_create_order} = params

            const sql = `INSERT INTO orders (openid, description, total, type, data, status, out_trade_no, order_over,time_create_order) VALUES (?, ?, ?, ?, ?, 0, ?, ?,?)`

            cfg.db.query(sql, [openid, description, total, type, data, out_trade_no, order_over, time_create_order], (err, result) => {
                // 错误检测
                if (err) {
                    console.log('错误，订单写入数据库失败：', err.sqlMessage)
                    return resolve({
                        code: 0,
                        msg: err.sqlMessage
                    })
                }
                resolve({
                    code: result.affectedRows ? true : false
                })
            })

        })
    },

    //  修改订单情况  需要传入订单号，以及修改的键值对 成功返回true 失败返回false
    updateOrder: async function (out_trade_no, params) {
        // params不能包含订单号
        // params.out_trade_no && delete params.out_trade_no

        // 循环params键值对 组成sql语句修改部分
        let sql_ = ''
        if (typeof params === 'string') {
            sql_ = params
        } else {
            for (let key in params) {
                sql_ += `${key} = ${params[key]},`
            }
            // 去除最后一个逗号
            sql_ = sql_.slice(0, -1)
        }

        // console.log(sql_)

        //  根据params生成sql语句 并且使用 订单号查询。
        const sql = `UPDATE orders SET ${sql_} WHERE out_trade_no = ${out_trade_no}`

        // console.log('：：修改sql：', sql)

        return new Promise(resolve => {
            cfg.db.query(sql, [params.status], (err, result) => {
                //  错误检测
                if (err) {
                    console.log('修改订单错误', sql, err.sqlMessage)
                    return resolve({code: 0, msg: err.sqlMessage})
                }
                resolve(result.affectedRows ? {code: 1} : {code: 0})
            })
        })

    },

    // 查询订单 最终返回订单对象
    queryOrder: function (out_trade_no) {
        return new Promise((resolve, reject) => {
            if (!out_trade_no) resolve({code: 0, data: null})
            const sql = `SELECT * FROM orders WHERE out_trade_no = ?`
            cfg.db.query(sql, [out_trade_no], (err, result) => {
                //  错误检测
                if (err) {
                    console.log(err)
                    return resolve({
                        code: 0,
                        msg: '查询订单失败' + err.sqlMessage
                    })
                }
                // 判定订单数
                if (!result.length) return resolve({
                    code: 0,
                    msg: '订单不存在',
                })
                return resolve({
                    code: 1,
                    data: result[0]
                })
            })
        })
    },

    // 删除订单
    deleteOrder: function (out_trade_no) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM orders WHERE out_trade_no = ?`
            cfg.db.query(sql, [out_trade_no], (err, result) => {
                //  错误检测
                if (err) return resolve({
                    code: 0,
                    msg: '删除订单失败' + err.sqlMessage
                })
                return resolve({
                    code: 1,
                    data: result[0]
                })
            })
        })
    },
}

//  导出订单系统
module.exports = system_order
