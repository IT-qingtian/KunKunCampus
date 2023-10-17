export default {
    namespaced: true,
    state: {
        //  用户token
        token: uni.getStorageSync('token') || '',
        //  测试用的信息
        // userInfo: {
        //     // name: "擎天大神",
        //     //  地址
        //     address: [
        //         {
        //             name: '擎天',
        //             phoneCode: 17778531443,
        //             numberPlate: 6644,
        //         },
        //         {
        //             name: '李二狗',
        //             phoneCode: 1231231443,
        //             numberPlate: 1213,
        //         }
        //     ]
        // },
        //  用户信息
        userInfo: {name: '擎天大佬', address: []},
        //  订阅消息id
        subscribeMessages_templIDs: [
            // //  抢单提醒
            // 'wD7ILVRlfivhxTQpLG35A2jhELJHaxRiGMbAY7QLOHk',
            // //  下单成功提醒
            // '6noRpLYC3O78mFA8xMfT_hOnFmSasUsSMD6SX-rfyWQ',
            // //  订单送达
            // 'un0JonFq4NTn7yLMux4o8OBtmfYUEFz2pBP6vVf6ZrE'
        ],
        //  功能模块
        function: {
            //  快递
            kd: {
                //  帮取
                tack: {}
            }
        },
        //  临时数据
        temp_data: {}
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
        //  增加用户地址
        add_address: (state, addressObj) => {
            state.userInfo.address.push(addressObj)
        },
        // 更新订阅消息
        updateSubscribeMessages_templIDs(state, subscribeMessages_templIDs) {
            state.subscribeMessages_templIDs = subscribeMessages_templIDs
        },
        // 获取用户地址
        async get_user_address(state) {
            // 给服务器发起请求 索要用户地址
            const {data: {code, data, msg, err}} = await uni.$httpRequest({
                url: 'user/user_address',
                method: 'post',
                //  配置token
                header: {
                    'Authorization': `Bearer ${state.token}`
                },
            })
            if (!code) return uni.showToast({
                title: msg,
                icon: "error"
            })
            // 更新地址
            state.userInfo.address = data.address
        },

        //  更新临时数据
        update_temp_data(state, data) {
            state.temp_data = data
        }
    }
}
