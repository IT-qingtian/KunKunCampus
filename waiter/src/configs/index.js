var __authorize_type;
(function (__authorize_type) {
    __authorize_type[__authorize_type["boss"] = 1] = "boss";
    __authorize_type[__authorize_type["run"] = 2] = "run";
})(__authorize_type || (__authorize_type = {}));
export default {
    // 前往授权
    goto_authorize(authorize_type, info = {}) {
        info.authorize_type = authorize_type;
        location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx312e2382a20cdbce&redirect_uri=http://yszz.17xf.cq.cn&response_type=code&scope=snsapi_base&state=${JSON.stringify(info)}#wechat_redirect`;
    },
    __authorize_type,
};
//# sourceMappingURL=index.js.map