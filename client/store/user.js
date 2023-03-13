export default {
    namespaced: true,
    state: {
        //  用户token
        token: uni.getStorageSync('token') || '',
        //  测试用的信息
        userInfo: {
            name: "擎天大神",
            lv: 100,
            money: 999999,
        },
        //  用户信息
        // userInfo: {}
        //  订阅消息id
        subscribeMessages_templIDs: ['6noRpLYC3O78mFA8xMfT_hOnFmSasUsSMD6SX-rfyWQ'],

    },

    mutations: {
        //  更新token信息
        updateToken: (state, tokenValue) => {
            state.token = tokenValue
            uni.setStorageSync('token', tokenValue)
        },
        //  更新用户信息
        updateUserInfo: (state, userInfo) => {
            state.userInfo = userInfo
        },
    }
}
