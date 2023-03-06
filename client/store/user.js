export default {
    namespaced: true,
    state: {
        token: uni.getStorageSync('token') || '',
    },
    mutations: {
        updateToken: (state, tokenValue) => {
            uni.setStorageSync('token', tokenValue)
        }
    }
}
