// stores/counter.js
import { defineStore } from 'pinia';
export const user = defineStore('user', {
    state: () => {
        return {
            // authorization 从 localStorage 中获取，不然为null
            authorization: uni.getStorageSync('authorization_boss') || null,
            authorization_run: uni.getStorageSync('authorization_run') || null,
            //  用户信息
            userInfo: {},
            //     费用
            service_fee: {}
        };
    },
    actions: {
        setAuthorization_run(authorization) {
            this.authorization_run = authorization;
            uni.setStorageSync('authorization_run', authorization);
        },
        setAuthorization(authorization) {
            this.authorization = authorization;
            uni.setStorageSync('authorization_boss', authorization);
        },
        setUserInfo(userInfo) {
            this.userInfo = userInfo;
        },
        setServiceFee(service_fee) {
            this.service_fee = service_fee;
        }
    }
});
//# sourceMappingURL=index.js.map