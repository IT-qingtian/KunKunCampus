const mysql = require('mysql2')
const ax = require('axios')
//  配置项
const cfg = require('../configs')
//  jwt
const jwt = require('jsonwebtoken')
const {sendErr, sendRes, message_tempIds} = require("../function/public");

const {db} = cfg

//  登陆模块  获取发来的 code 然后获取到openid 将openid返回给用户。
const login = async (req, res) => {
    const params = req.body
    if (params) {
        const {code} = params
        //  传入
        const result = await ax.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: cfg.appid,
                secret: cfg.secret,
                js_code: code,
                grant_type: cfg.secret
            }
        })
        const {data: {session_key, openid}} = result
        //  获取到数据
        if (openid) {
            //  数据库校验
            const result_logon = await logon(openid)
            if (!result_logon.code) return sendErr(res, '登陆校验失败。')

            //  生成jwt token
            const token = jwt.sign({openid}, cfg.secret_token, {
                expiresIn: cfg.expriseIn_token
            })
            console.log('Bearer ' + token)
            console.log('openid ' + openid)
            //  顺带从数据库里获取用户信息 直接返回给用户。
            // 去除result_logon里面的openid
            delete result_logon.data.openid
            // 获取用户地址
            const sql = `select * from users_address where openid=?`
            db.query(sql, [openid], (err, result) => {
                if (err) return sendErr(res, '获取用户地址失败')
                const address = result
                // 将地址添加到用户信息里面
                result_logon.data.address = address

                sendRes(res, {
                    token,
                    userInfo: result_logon.data,
                })

            })
        } else {
            sendErr(res, '获取openid失败')
        }
    } else {
        sendErr(res, '未收到params')
    }
};

//  注册校验 传入用户openid  如果注册过 就返回用户信息 没注册就注册   失败返回false
const logon = (openid) => {
    return new Promise((resolve, reject) => {
        // 查询openid 如果不存在openid 则创建
        const sql = `select * from users where openid='${openid}'`
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
                const sql = 'insert into users(name,sex,openid) values (?,?,?)'
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

//  登陆模块  获取发来的 code 然后获取到openid 将openid返回给用户。
const login_dev = async (req, res) => {
    const openid = `dev_wx_openid`
    //  数据库校验
    const result_logon = await logon(openid)

    if (!result_logon.code) return sendErr(res, '登陆校验失败。')

    //  生成jwt token
    const token = jwt.sign({openid}, cfg.secret_token, {
        expiresIn: cfg.expriseIn_token
    })
    console.log('Bearer ' + token)
    console.log('openid ' + openid)
    //  顺带从数据库里获取用户信息 直接返回给用户。
    // 去除result_logon里面的openid
    delete result_logon.data.openid
    sendRes(res, {
        token,
        userInfo: result_logon.userInfo,
    })
};

// 获取订阅消息数组
const getSubscribeMesTIDS = (req, res) => {
    // 订阅消息数组
    const subScribeMesTIDS = Object.keys(message_tempIds.miniprogram).map(key => {
        return message_tempIds.miniprogram[key]
    })
    //  携带订阅消息tempIds
    sendRes(res, subScribeMesTIDS)
}

module.exports = {
    login,
    login_dev,
    getSubscribeMesTIDS
};
