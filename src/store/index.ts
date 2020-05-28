import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    users: {} as any,
    selectedUsers: [] as any,
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

    removeUser (state, userID: string) {
      // userID == peerID
      delete state.users[userID]
    },

    selectUser (state, userID) {
      state.selectedUsers.push(userID)
    },

    deselectUser (state, userID) {
      state.selectedUsers.splice(state.selectedUsers.indexOf(userID), 1)
    },

    clearSelectedUsers (state) {
      state.selectedUsers = []
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
