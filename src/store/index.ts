import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    users: {},
    receivedFiles: {}
  },
  mutations: {
    addUser (state, payload) {
      Vue.set(state.users, payload.id, {
        name: payload.name,
        color: payload.color,
        conn: payload.conn
      })
    },

    receiveFile (state, payload) {
      Vue.set(state.receivedFiles, payload.infoHash, payload.name)
    }
  },
  actions: {
  },
  modules: {
  }
})
