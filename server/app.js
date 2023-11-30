// const clipboardy = require('clipboardy');
const multiparty = require('multiparty')
// 引入fs
const fs = require('fs')
const path = require('path')

const bodyParser = require('body-parser');
// 使用https协议
const https = require('https')
//  读取证书
// const privateKey = fs.readFileSync(path.join(__dirname, './ssl/2_www.51yund.com.key'), 'utf8')


//  数据库
const mysql = require('mysql2')
//  express框架
const express = require("express");
//  配置项
const cfg = require('./configs')
// 引入公共方法
const {
    verifyToken,
    verifyToken_official,
    emit_subscribe_msg,
    formatTime,
    sendRes,
    sendErr,
    generateRandomString
} = require('./function/public')


//  解析携带的token参数
const {expressjwt: jwt} = require("express-jwt");
//  导入跨域
const cors = require('cors')
const axios = require("axios");

//  连接数据库
{
    const db = mysql.createConnection({
        host: cfg.mysql_database.host,
        database: cfg.mysql_database.database,
        user: cfg.mysql_database.user,
        password: cfg.mysql_database.password,
        // timezone: "+8:00"
    })

    db.on('error', (err) => {
        return console.log('数据库连接失败', err)
    })
    console.log('数据库连接成功')
    db.checkErr = (err) => {
        if (err) return console.log('连接数据库错误！')
    }
    cfg.db = db
}

// console.log(cfg.db)

//  搭建服务
const app = express();
// 暴露静态文件
app.use('/static', express.static('static'))

// 使用cors
app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

//  用于解析post请求携带的参数
app.use(express.urlencoded({extended: false}))
app.use(express.json())


//  产出解析token req.user
app.use(jwt({
    //  token密钥
    secret: cfg.secret_token,
    //  加密方案
    algorithms: ["HS256"]
}).unless({
    //  需要排除的路径
    path: [
        // 排除static目录
        ...cfg.except_path,
        ...cfg.except_path_official
    ]
}));

// 捕捉token解析的错误
app.use((err, req, res, next) => {
    // console.log(req.headers)
    // console.log('捕捉到jwt错误 具体错误信息：', req.originalUrl + '  ' + err.name)
    const {name: errName} = err
    switch (errName) {
        case 'UnauthorizedError':
            res.send({
                code: 0,
                msg: '身份码无效！'
            })
            break
        default:
            res.send({
                code: 0,
                msg: 'token，未知的错误，建议联系程序管理员！errName:' + err.name
            })
    }
})

//  路由区
{
    // 骑手/商户 获取身份码
    app.post('/get_invitation_code', async (req, res) => {
        //     获取参数
        const {code} = req.body
        if (!code) return sendErr(res, '错误，参数丢失')
        //     通过code去请求微信服务器来获取openid

        const {data: result} = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
            params: {
                appid: cfg.appid_official,
                secret: cfg.secret_official,
                code,
                grant_type: 'authorization_code'
            }
        })
        // 根据result的errcode判断是否成功
        const {errcode, errmsg} = result
        if (errcode) return sendErr(res, errmsg)

        // 拿openid
        const {openid} = result
        sendRes(res, {invitation_code: openid})
    })

    //  路由-my （包涵登陆）
    const router_my = require("./router/my");
    // token验证
    app.use('/my', verifyToken)
    app.use("/my", router_my);
    //  路由 用户（包涵 获取用户地址等）
    const router_user = require("./router/user");
    app.use('/user', verifyToken)
    app.use("/user", router_user);
    // 路由-店铺
    const router_shop = require('./router/shop')
    app.use('/shop', verifyToken)
    app.use('/shop', router_shop)
    //  路由-快递
    const router_kd = require('./router/kuaidi')
    app.use('/kd', verifyToken)
    app.use("/kd", router_kd);
    //  路由-订单
    const router_orders = require('./router/orders')
    app.use('/orders', verifyToken)
    app.use("/orders", router_orders);

    //  路由-run 【骑手端口】
    const router_run = require('./router/run')
    app.use('/run', verifyToken_official)
    app.use("/run", router_run);

// 路由-boss 【商家端口】
    const router_boss = require('./router/boss')
    app.use('/boss', verifyToken_official)
    app.use('/boss', router_boss)

    app.use('/get_service_fee', (req, res) => {
        //  返回费用。
        sendRes(res, cfg.service_fee)
    })
}

// 使用的协议，如果0就是http协议 1为https
const agreement = 0

const server = agreement ? https.createServer({
    key: fs.readFileSync(path.join(__dirname, './ssl/9499016_www.linglan01.cn.key')),
    cert: fs.readFileSync(path.join(__dirname, './ssl/9499016_www.linglan01.cn.pem')),
}, app) : app

//  使用服务
server.listen(38000, () => {
    console.log("服务器启动成功。");
});
