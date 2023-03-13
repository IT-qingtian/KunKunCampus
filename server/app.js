const express = require("express");
//  配置项
const cfg = require('./configs')


//  解析token
const {expressjwt: jwt} = require("express-jwt");


// appid
// wxe56880a7f78c6d98
// mchid
// 1635165643

// APIv3密码
// vhB1mxBCeznKnDk8pUgmmEgBs8vVcoJl

//  {async function payInfo(req, res) {
//   const params = {
//     description: "Asnull的支付测试", // 订单描述
//     out_trade_no: "2022080711111112", // 订单号，一般每次发起支付都要不一样，可使用随机数生成
//     notify_url: "https://pay.lipux.cn/notify_url",
//     amount: {
//       total: 1, // 支付金额，单位为分
//     },
//     payer: {
//       openid: "ojBBU4zxPRGBKWdGrP-H-C9XYZLg",
//     },
//     scene_info: {
//       payer_client_ip: "ip",
//     },
//   };
//   const result = await pay.transactions_jsapi(params);
//   console.log(result);
// }
// payInfo();
// console.log(new Date().getTime());
// const as = {
//   description: "测试",
//   out_trade_no: "2022080719112112",
//   notify_url: "https://www.baidu.com",
//   amount: {
//     total: 1,
//   },
//   scene_info: {
//     payer_client_ip: "ip",
//   },
// };
// const result = pay.transactions_native(as);
// result.then((e) => {
//   console.log("ok", e);
// });}

//  搭建服务
const app = express();

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
        /^\/my\/login(\/.+)*$/,
    ]
}));
//  捕捉错误
app.use((err, req, res, next) => {
    console.log('捕捉到错误 具体错误信息：', err.name)
    const {name: errName} = err
    switch (errName) {
        case 'UnauthorizedError':
            res.send({
                code: 0,
                msg: 'token失效！'
            })
            break
        default:
            res.send({
                code: 0,
                msg: '未知的错误，建议联系程序管理员！errName:' + err.name
            })
    }
})

//  路由-my （包涵登陆）
const router_my = require("./router/my");
app.use("/my", router_my);

const router_user = require("./router/user");
app.use("/user", router_my);

//  路由-快递
const router_kd = require('./router/kuaidi')
app.use("/kd", router_kd);

app.listen(38000, () => {
    console.log("服务器启动成功。");
});
