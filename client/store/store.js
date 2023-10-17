import Vue from 'vue'
import Vuex from 'vuex'
import user from '@/store/user.js'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		'store_user': user
	}
})

export default store

