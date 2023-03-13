const ax = require('axios')
//  配置项
const cfg = require('../configs')

const jwt = require("jsonwebtoken");

//  取快递-支付。
const takePay = async (req, res) => {
    //  拿到token
    const token = req.headers.authorization.split(' ')[1];
    // 没有token
    if (!token) res.send({
        code: 0,
        msg: "token不存在"
    })
    // 解析token 获取openid
    jwt.verify(token, cfg.secret_token, async (err, decoded) => {
        if (err) {
            res.send({
                code: 0,
                msg: '身份校验不通过'
            })
        } else {
            //  校验通过后，开始获取签证信息，然后丢给前端 前端用数据进行请求。
            const openid = decoded.openid
            //  解析body数据
            const params = req.body
            //  生成订单
            if (params) {
                // 申请订单
                const par = {
                    description: '帮取快递订单',
                    out_trade_no: String(Date.now()),
                    notify_url: 'http://17xf.cq.cn',
                    amount: {
                        //  金额
                        total: 1,
                    },
                    payer: {
                        openid,
                    },
                    scene_info: {
                        payer_client_ip: 'ip',
                    },
                };
                console.log('params', params);

                const payInfo = await cfg.wx_pay.transactions_jsapi(par)
                if (!payInfo.paySign) {
                    return res.send({
                        code: 1,
                        msg: '下单失败，微信支付接口错误。',
                    })
                }
                //  抹除掉status和appid
                delete payInfo.status
                delete payInfo.appId
                res.send({
                    code: 1,
                    msg: '下单成功，正在找人为您取件。',
                    data: {
                        payInfo
                    }
                })

            } else {
                res.send({
                    code: 0,
                    msg: '服务器未收到参数。'
                })
            }
        }
    })
};

//  查询订单
const order_query = async (req, res) => {
    const params = req.body
    const {out_trade_no} = params
    //  校验是否有订单参数
    if (!out_trade_no) return res.send({
        code: 0,
        msg: '查询失败，无订单参数。'
    })
    //  通过订单去查询交易
    const order = await cfg.wx_pay.query({out_trade_no});
    if (order.status === 200) {
        //  解析openid
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, cfg.secret_token, (err, decode) => {
            //  处理token
            if (err) {
                res.send({
                    code: 0,
                    msg: "解析openid失败。"
                })
            } else {
                const openid = decode.openid
                //  通过openid 告知用户 付款成功。
                ax.post('https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=' + cfg.access_.access_token, {
                    //  用户openid
                    "touser": openid,
                    //  消息模板id
                    "template_id": "6noRpLYC3O78mFA8xMfT_hOnFmSasUsSMD6SX-rfyWQ",
                    //  填充数据
                    "data": {
                        "thing1": {
                            "value": "取快递"
                        },
                        "thing3": {
                            "value": '擎天大神'
                        },
                        "time4": {
                            "value": "2008年02月08日 01:01"
                        },
                        "time6": {
                            "value": "2008年02月08日 01:01"
                        }
                    },
                    //  开发状态
                    "miniprogram_state": cfg.miniprogram_state,
                    //  语言
                    "lang": "zh_CN"
                })

                res.send({
                    code: 1,
                    msg: "服务器查询到订单，用户已支付。"
                })
            }
        })

    } else {
        res.send({
            code: 0,
            msg: "订单查询失败！您还尚未支付。"
        })
    }
    console.log(order)
}


module.exports = {
    takePay,
    order_query
};
