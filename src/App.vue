<template>
  <div id="app">
    <Navbar/>
    <transition name='slide'>
      <keep-alive>
        <router-view/>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import * as hashSum from 'hash-sum'
import * as P2PT from 'p2pt'
import * as publicIP from 'public-ip'

export default {
  name: 'App',

  methods: {
    init () {
      this.setUpP2PT()

      this.$store.subscribe((mutation) => {
        if (mutation.type === 'activateInternetShare') {
          this.$store.commit('destroyP2PT')
          this.startP2PT(this.$store.state.roomID)
        }
      })
    },

    setUpP2PT () {
      publicIP.v4().then((ip) => {
        const roomID = hashSum(ip).substr(0, this.$INTERNET_ROOM_CODE_LENGTH)
        this.$store.commit('setRoom', roomID)
        this.startP2PT(roomID)
      }).catch(error => {
        console.log(error)
        this.$buefy.snackbar.open({
          message: 'Could not find your IP address',
          type: 'is-danger',
          queue: true,
          indefinite: true,
          actionText: 'Retry',
          onAction: this.setUpP2PT
        })
      })
    },

    startP2PT (identifier) {
      const p2pt = new P2PT(this.$ANNOUNCE_URLS)
      p2pt.setIdentifier('webdrop' + identifier)

      p2pt.on('peerconnect', (peer) => {
        p2pt.send(peer, JSON.stringify({
          type: 'init',
          name: this.$store.state.myName,
          color: this.$store.state.myColor
        }))
      })

      p2pt.on('msg', (peer, msg) => {
        try {
          msg = JSON.parse(msg)
        } catch (_) {
          return
        }

        if (msg.type === 'init') {
          this.$store.commit('addUser', {
            id: peer.id,
            name: msg.name,
            color: msg.color,
            conn: peer
          })
        } else if (msg.type === 'ping') {
          this.$buefy.snackbar.open({
            duration: 3000,
            message: `<b>${this.$store.state.users[peer.id].name}</b> pinged!`,
            type: 'is-warning',
            queue: false
          })
        } else if (msg.type === 'newTorrent') {
          delete msg.type
          msg.peer = peer
          this.$store.commit('newTorrent', msg)
        }
      })

      p2pt.on('peerclose', (peer) => {
        this.$store.commit('removeUser', peer.id)
      })

      let warningCount = 0
      p2pt.on('trackerwarning', (blah, stats) => {
        warningCount++

        if (warningCount >= stats.total && stats.connected === 0) {
          console.error(blah)

          this.$buefy.snackbar.open({
            message: 'We couldn\'t connect to any WebTorrent trackers. A page refresh might help.\nYour ISP might be blocking them 🤔',
            type: 'is-danger',
            queue: true,
            indefinite: true,
            actionText: 'Retry',
            onAction: () => {
              this.$store.commit('destroyP2PT')
              this.startP2PT(identifier)
            }
          })
        }
      })

      p2pt.on('trackerconnect', () => {
        this.status = 'Connected!'
        warningCount--
      })

      this.$store.commit('setP2PT', p2pt)
      p2pt.start()
    }
  },

  mounted () {
    this.init()
  }
}
</script>

<style lang="sass">
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400&display=swap');

#app
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

.navbar
  padding-top: 10px
  padding-bottom: 10px
  transition: 0.2s all

  // disable start & end and only use brand
  .navbar-brand
    width: 100%

  &.has-shadow
    box-shadow: 0 5px 30px 0 #AAA !important

  .actions
    display: flex
    align-items: stretch
    justify-content: flex-end
    margin-left: auto

    a
      color: #fff

.main-navbar .navbar-brand
  width: auto
</style>
