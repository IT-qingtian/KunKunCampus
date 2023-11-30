enum __authorize_type {
    boss = 1,
    run = 2
}

interface _get_authorize_info {
    authorize_type?: __authorize_type

    [key: string]: any
}

export default {
    // 前往授权
    goto_authorize(authorize_type: __authorize_type, info: _get_authorize_info = {}) {
        info.authorize_type = authorize_type
        location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx312e2382a20cdbce&redirect_uri=http://yszz.17xf.cq.cn&response_type=code&scope=snsapi_base&state=${JSON.stringify(info)}#wechat_redirect`
    },
    __authorize_type,
}