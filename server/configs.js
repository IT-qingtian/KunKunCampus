const WxPay = require("wechatpay-node-v3");
const fs = require("fs");
const axios = require('axios')

//  小程序/公众号 id
const appid = "wxd3a171dcdbb329bc"
const appid_official = 'wx312e2382a20cdbce'
//  密钥
const secret = 'de91237cfeff86326faad1c0d5425a9f'
const secret_official = '81bfae8b76183424b1a07e6e7ffc4f89'
//  商户号id
const mchid = "1635165643"

// 服务费
const service_fee = {
    //  店铺
    shop: 0.01,
    shop_delivery: 0.5,
    // 快递
    kd: 0.01,
}


//  两小时会更新一次，所以我设定时器 时间快到了就更新一次。
const access_ = {
    //  小程序版
    access_token_miniProcedure: '',
    access_token_official: ''
}
//  自动更新认证token
const updateAccess_token = async () => {
    //  获取公众号 token
    axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
            appid: appid_official,
            secret: secret_official,
            grant_type: 'client_credential'
        }
    }).then(res => {
        const {data: result_updateAccess_token_official} = res
        const {access_token, errmsg} = result_updateAccess_token_official
        if (!access_token) return console.error('错误，获取result_updateAccess_token_official失败！\n', errmsg)
        access_.access_token_official = access_token
        console.log('::access_token_official\n', access_token)
    })
    //  获取小程序 token
    axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
            appid,
            secret,
            grant_type: 'client_credential'
        }
    }).then(res => {
        const {data: access_token_miniProcedure} = res
        const {access_token, errmsg} = access_token_miniProcedure
        if (!access_token) return console.error('错误，获取access_token_miniProcedure失败！\n', errmsg)
        access_.access_token_miniProcedure = access_token
        console.log('::access_token_miniProcedure\n', access_token)
    })

    //  1.8小时以后更新access_token
    setTimeout(updateAccess_token, 1000 * 60 * 60 * 1.8)
}

//  获取access_token
updateAccess_token()

module.exports = {
    //  小程序appid
    appid,
    //  公众号appid
    appid_official,
    //  小程序秘钥
    secret,
    // 公众号密钥
    secret_official,
    //  商户id
    mchid,
    //  换取openid的方式
    grant_type: "authorization_code",
    //  apiV3密码
    apiV3: 'vhB1mxBCeznKnDk8pUgmmEgBs8vVcoJl',
    // 用于生成token的密钥
    secret_token: 'itQINGTIAN-v-!',
    // token时效 这里是十天。
    expriseIn_token: `${60 * 60 * 24 * 10}s`,
    //  访问令牌
    access_,
    //  微信支付
    wx_pay: new WxPay({
        appid,
        mchid,
        publicKey: fs.readFileSync("./credentials/wxPay/apiclient_cert.pem"), // 公钥
        privateKey: fs.readFileSync("./credentials/wxPay/apiclient_key.pem"), // 秘钥
    }),
    //  小程序阶段状态
    miniprogram_state: 'developer',
    //  数据库
    db: null,
    //  数据库 配置
    mysql_database: {
        host: "localhost",
        database: "kunkunCampus",
        user: "root",
        password: "Qingtian6."
    },
    //     模板id
    temp_id: {
        //  模板编号_抢单
        temp_id_order_grabbing: 'CCzvyfjnGlJGdQ29NLGGju7INVrWeiAQATxW48vO7_E',
        //  模板编号_通知店铺接单
        temp_id_notice_shop_receving_order: 'CCzvyfjnGlJGdQ29NLGGju7INVrWeiAQATxW48vO7_E',
        //  模板编号_通知商户有新订单
        notice_shop_new_order: 'mac_Mg_00GzwNeRZ6OWGTCebxjURPbLfAVWaNYdo_Q8',
    },
    // 用于排除的路径
    except_path: [
        /^\/my\/login$/,
        /^\/demo$/,
        /^\/my\/login_dev$/,
        /^\/my\/getSubscribeMesTIDS$/
    ],
    except_path_official: [
        /^\/run\/login$/,
        /^\/boss\/login$/
    ],
    service_fee
}