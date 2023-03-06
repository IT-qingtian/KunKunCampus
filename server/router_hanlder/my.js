// const payload = {
//     userId: '1234567890',
// };
// const options = {
//     expiresIn: '1h'
// };
//
// const token = jwt.sign(payload, secret, options);
//
// console.log(token);

const ax = require('axios')
//  配置项
const cfg = require('../configs')
//  jwt
const jwt = require('jsonwebtoken')

//  登陆模块  获取发来的 code 然后获取到openid 将openid返回给用户。
const login = async (req, res) => {
    const params = req.body
    if (params) {
        const {code} = params
        //
        const result = await ax.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: cfg.appid,
                secret: cfg.secret,
                js_code: code,
                grant_type: cfg.secret
            }
        })
        const {data} = result
        //  获取到数据
        if (data.openid) {
            const {session_key, openid} = data
            //  生成jwt
            const token = jwt.sign({openid}, cfg.secret_token, {
                expiresIn: cfg.expriseIn_token
            })
            console.log('Bearer ' + token)
            //  顺带从数据库里获取用户信息 直接返回给用户。

            res.send({
                code: 1,
                msg: '登陆成功',
                data: {
                    // session_key,
                    // openid,
                    token
                }
            })
        } else {
            res.send({
                code: 0,
                msg: '获取openid失败'
            })
        }
    } else {
        res.send({
            code: 0,
            msg: '未收到params'
        })
    }
};

module.exports = {
    login,
};
