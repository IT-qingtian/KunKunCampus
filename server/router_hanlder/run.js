// 引入cfg
const cfg = require('../configs')

const {db} = cfg

const {sendRes, sendErr, db_query} = require("../function/public");
const axios = require("axios");
// 引入jwt
const jwt = require('jsonwebtoken')
const {expriseIn_token} = require("../configs");

const login = async (req, res) => {
    //  获取参数
    const params = req.body
    // 验证参数
    const {code} = params
    if (!code) return sendErr(res, 'code参数错误')
    console.log('code是：', code)
    // 通过code获取 appid

    const {data: result} = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
        params: {
            appid: cfg.appid_official, secret: cfg.secret_official, code, grant_type: 'authorization_code'
        }
    })
    console.log(result)
    // 根据result的errcode判断是否成功
    const {errcode, errmsg} = result
    if (errcode) return sendErr(res, errmsg)

    // 拿openid
    const {openid} = result

    //  数据库校验
    const result_logon = await logon(openid)
    if (!result_logon.code) return sendErr(res, '登陆校验失败。')

    // 生成token
    const token = jwt.sign({openid_official: openid}, cfg.secret_token, {expiresIn: expriseIn_token})
    console.log('获取到 跑腿端登陆 token:', token)
    // 获取
    sendRes(res, {token}, '登陆成功')
}

//  注册校验 传入用户openid  如果注册过 就返回用户信息 没注册就注册   失败返回false
const logon = (openid) => {
    return new Promise((resolve, reject) => {
        // 查询openid 如果不存在openid 则创建
        const sql = `select * from users_run where openid='${openid}'`
        db.query(sql, (err, result) => {
            if (err) {
                console.log('查询用户是否存在  出现问题', err.sqlMessage, err, sql)
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
                    code: 1, data
                })
            } else {
                console.log('用户不存在，正在注册')
                //   没有数据 新建一个数据
                const info = {
                    name: '用户' + new Date().getTime(), sex: 1, openid,
                }
                //  定义插入用户sql语句
                const sql = 'insert into users_run (name,sex,openid) values (?,?,?)'
                db.query(sql, [info.name, info.sex, info.openid], (err, result) => {
                    if (err) {
                        console.log('插入新用户遇到错误', err.sqlMessage)
                        resolve({
                            code: 0, msg: err.sqlMessage
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
                            code: 0, msg: '注册失败'
                        })
                    }
                })
            }
        })
    })
}

const get_user_info = async (req, res) => {
    const {openid} = req
    //  获取信息返回给用户
    const d_info = await db_query('select * from users_run where openid=?', openid)
//     是否获取到
    if (!d_info.code) return sendErr(res, '无法获取到信息！')
    console.log('获取到用户信息', d_info.data[0].openid)
//     删除敏感信息
    delete d_info.data[0].openid
    sendRes(res, d_info.data[0], '获取到用户信息')
}

// 导出
module.exports = {
    login, get_user_info
}