import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    myColor: '',
    myName: '',

    users: {} as any,
    selectedUsers: [] as any,
    torrents: {},

    p2pt: {} as any,

    internetShare: false,
    roomID: ''
  },
  mutations: {
    initProfile (state, payload) {
      state.myColor = payload.color
      state.myName = payload.name
    },

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

    selectUser (state, userID: string) {
      state.selectedUsers.push(userID)
    },

    deselectUser (state, userID: string) {
      state.selectedUsers.splice(state.selectedUsers.indexOf(userID), 1)
    },

    clearSelectedUsers (state) {
      state.selectedUsers = []
    },

    // torrent added by user
    addTorrent (state, payload) {
      Vue.set(state.torrents, payload.i, {
        ...payload,
        ...{ m: true } // m for mine
      })
    },

    // torrent received from a peer
    newTorrent (state, payload) {
      Vue.set(state.torrents, payload.i, {
        ...payload,
        ...{ m: false } // m for mine
      })
    },

    setRoom (state, roomID: string) {
      state.roomID = roomID
    },

    activateInternetShare (state, roomID: string) {
      state.internetShare = true
      state.roomID = roomID
    },

    setP2PT (state, payload) {
      state.p2pt = payload
    },

    destroyP2PT (state) {
      if (state.p2pt !== null) {
        state.p2pt.destroy()
        state.users = {}
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
