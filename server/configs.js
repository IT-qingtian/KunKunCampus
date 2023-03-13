const WxPay = require("wechatpay-node-v3");
const fs = require("fs");
const axios = require('axios')

const appid = "wxd3a171dcdbb329bc"
const secret = 'de91237cfeff86326faad1c0d5425a9f'
const mchid = "1635165643"

//  两小时会更新一次，所以我设定时器 时间快到了就更新一次。
const access_ = {
    access_token: ''
}
const updateAccess_token = async () => {
    const {data: result_updateAccess_token} = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
            appid,
            secret,
            grant_type: 'client_credential'
        }
    })
    access_.access_token = result_updateAccess_token.access_token

    //  1.8小时以后更新access_token
    setTimeout(updateAccess_token, 1000 * 60 * 60 * 1.8)
}

//  获取access_token
updateAccess_token()


module.exports = {
    //  小程序appid
    appid,
    //  小程序秘钥
    secret,
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
    miniprogram_state: 'developer'
}
