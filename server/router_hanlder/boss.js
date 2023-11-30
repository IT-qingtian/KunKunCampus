// 引入cfg
const cfg = require('../configs')

const {db} = cfg

const {sendRes, sendErr, db_query} = require("../function/public");
const axios = require("axios");
// 引入jwt
const jwt = require('jsonwebtoken')

// const login = async (req, res) => {
//     //  获取参数
//     const params = req.body
//     // 验证参数
//     const {code} = params
//     if (!code) return sendErr(res, 'code参数错误')
//     console.log('code是：', code)
//     // 通过code获取 appid
//
//     const {data: result} = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
//         params: {
//             appid: cfg.appid_official,
//             secret: cfg.secret_official,
//             code,
//             grant_type: 'authorization_code'
//         }
//     })
//     console.log(result)
//     // 根据result的errcode判断是否成功
//     const {errcode, errmsg} = result
//     if (errcode) return sendErr(res, errmsg)
//
//     // 拿openid
//     const {openid} = result
//
//     //  数据库校验
//     const result_logon = await logon(openid)
//     if (!result_logon.code) return sendErr(res, '登陆校验失败。')
//
//     // 通过用户shop_id来获取店铺信息。
//     const result_shop = await db_query(`select sales_volume_day,amount_day from shop where id = ${result_logon.data.shop_id}`)
//     if (!result_shop.code) return sendErr(res, '登陆失败，查询不到店铺信息。')
//
//     // 整合在一起
//     Object.assign(result_logon.data, result_shop.data[0])
//
//     // 生成token
//     const token = jwt.sign({openid_official: openid}, cfg.secret_token, {expiresIn: '99999h'})
//     console.log('获取到 商户端登陆 token:', token)
//     // 获取
//     sendRes(res, {
//         token,
//         userInfo: result_logon.data
//     }, '登陆成功')
// }
const login = async (req, res) => {
    //  获取参数
    const params = req.body
    // 验证参数
    const {code} = params
    if (!code) return sendErr(res, '无code参数')
    console.log('商户登录 - code是：', code)
    // 通过code获取 appid
    const {data: result} = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
        params: {
            appid: cfg.appid_official,
            secret: cfg.secret_official,
            code,
            grant_type: 'authorization_code'
        }
    })
    console.log(result)
    // 根据result的errcode判断是否成功
    const {errcode, errmsg} = result
    if (errcode) return sendErr(res, errmsg)

    // 拿openid
    const {openid} = result
    // 获取users信息
    const sql = `select * from users_boss where openid=?`
    const user_r = await db_query(sql, [openid])
    if (!user_r.code) return sendErr(res, '未登记商户信息。')
    const {shop_id} = user_r.data[0]


    //  数据库校验
    // const result_logon = await logon(openid)
    // if (!result_logon.code) return sendErr(res, '登陆校验失败。')

    // 通过用户shop_id来获取店铺信息。
    const result_shop = await db_query(`select sales_volume_day,amount_day from shop where id = ${shop_id}`)
    if (!result_shop.code) return sendErr(res, '错误，您的店铺查询不到。')

    // 整合在一起
    Object.assign(user_r.data[0], result_shop.data[0])

    // 生成token
    const token = jwt.sign({openid_official: openid}, cfg.secret_token, {expiresIn: '99999h'})
    console.log('获取到 商户端登陆 token:', token)
    // 获取
    sendRes(res, {
        token,
        userInfo: user_r.data[0]
    }, '登陆成功')
}

//  注册校验 传入用户openid  如果注册过 就返回用户信息 没注册就注册   失败返回false
const logon = (openid) => {
    return new Promise((resolve, reject) => {
        // 查询openid 如果不存在openid 则创建
        const sql = `select * from users_boss where openid='${openid}'`
        db.query(sql, (err, result) => {
            if (err) {
                console.log('查询用户是否存在出现问题', err.sqlMessage, sql)
                return resolve({code: 0, msg: err.sqlMessage})
            }
            //  有数据 可以直接返回
            if (result.length) {
                console.log('用户存在，正在返回数据')
                const data = result[0]
                //  删除result里面的id
                delete data.id
                // 返回数据
                resolve({
                    code: 1,
                    data
                })
            } else {
                console.log('用户不存在，正在注册')
                //   没有数据 新建一个数据
                const info = {
                    name: '用户' + new Date().getTime(),
                    sex: 1,
                    openid,
                }
                //  定义插入用户sql语句
                const sql = 'insert into users_boss (name,sex,openid) values (?,?,?)'
                db.query(sql, [info.name, info.sex, info.openid], (err, result) => {
                    if (err) {
                        console.log('插入新用户遇到错误', err.sqlMessage)
                        resolve({
                            code: 0,
                            msg: err.sqlMessage
                        })
                    }

                    //  判断是否插入
                    if (result.affectedRows) {
                        //    插入数据成功
                        console.log('注册成功')
                        //  调用本身 查看是否注册
                        logon(openid)
                    } else {
                        //    插入数据失败
                        console.log('注册失败')
                        resolve({
                            code: 0,
                            msg: '注册失败'
                        })
                    }
                })
            }
        })
    })
}

// 获取店铺信息
const getShopInfo = async (req, res) => {
    const {openid} = req
    if (!openid) return sendErr(res, '无法校验身份请重新登录')
    // 从用户表联到shop表
    const r_user = await db_query(`select * from users_boss where openid = '${openid}'`)
    if (!r_user.code) return sendErr(res, '获取用户信息失败！')
    const shop_id = r_user.data[0].shop_id
    const r_shop = await db_query(`select * from shop where id = '${shop_id}'`)
    if (!r_shop.code) return sendErr(res, '获取店铺失败！')
    // 删除非必要数据 把店铺数据返回给用户
    const data = r_shop.data[0]
    delete data.id
    delete data.goods

    delete data.sales_volume
    delete data.sales_volume_day

    delete data.amount
    delete data.amount_day
    delete data.score
    delete data.start_run_price
    delete data.comment

    sendRes(res, data)
}

// 导出
exports.default = {
    login,
    getShopInfo
}
