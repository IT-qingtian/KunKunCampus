export default {
    namespaced: true,
    state: {
        // 宿舍性别分组
        dorm_sex_group: {
            man: [],
            girl: [],
        },
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
        userInfo: {name: '尊敬的用户', address: []},
        service_fee: {},
        //  订阅消息id
        subscribeMessages_templIDs: [],
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
        update_dorm_sex_group: (state, group) => {
            const {man, girl} = group
            state.dorm_sex_group.man = man ?? []
            state.dorm_sex_group.gril = girl ?? []
        },
        //  更新token信息
        updateToken: (state, tokenValue) => {
            state.token = tokenValue
            uni.setStorageSync('token', tokenValue)
        },
        //  更新用户信息
        updateUserInfo: (state, userInfo) => {
            state.userInfo = userInfo
        },
        // 更新服务费用
        updateServiceFee(state, service_fee) {
            state.service_fee = service_fee
            console.log(state.service_fee)
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
        async get_user_address(state, hidden_err) {
            // 给服务器发起请求 索要用户地址
            const {data: {code, data, msg, err}} = await uni.$httpRequest({
                url: 'user/user_address',
                method: 'post',
                //  配置token
                header: {
                    'Authorization': `Bearer ${state.token}`
                },
            })
            if (!code) {
                !hidden_err && uni.showToast({
                    title: msg,
                    icon: "error"
                })
                return
            }
            // 更新地址
            state.userInfo.address = data.address
        },

        //  更新临时数据
        update_temp_data(state, data) {
            state.temp_data = data
        }
    }
}
