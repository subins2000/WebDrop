<template>
  <div id="app">
    <transition name='slide'>
      <keep-alive>
        <router-view/>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import Bowser from 'bowser'
import * as hashSum from 'hash-sum'
import * as P2PT from 'p2pt'
import * as publicIP from 'public-ip'

const getName = () => {
  const bowser = Bowser.getParser(window.navigator.userAgent)

  return `${bowser.getOSName()} ${bowser.getBrowserName()}`
}

const getAColor = () => {
  // l in 'hsla' stands for lightness
  return `hsla(${~~(360 * Math.random())},70%,60%,1)`
}

export default {
  name: 'App',

  data () {
    return {
      myName: getName()
    }
  },

  methods: {
    init () {
      this.myColor = sessionStorage.getItem('myColor')
      if (!this.myColor) {
        this.myColor = getAColor()
        sessionStorage.setItem('myColor', this.myColor)
      }

      this.setUpP2PT()
    },

    setUpP2PT () {
      this.startP2PT('a')
      publicIP.v4().then((ip) => {
        const roomID = hashSum(ip).substr(0, this.$INTERNET_ROOM_CODE_LENGTH)
        this.$store.commit('setRoom', roomID)
        // this.startP2PT(roomID)
      }).catch(error => {
        console.log(error)
        this.status = 'Could not find your IP address'
      })
    },

    startP2PT (identifier) {
      const p2pt = new P2PT(this.$ANNOUNCE_URLS)
      p2pt.setIdentifier('webdrop' + identifier)

      p2pt.on('peerconnect', (peer) => {
        this.status = ''
        p2pt.send(peer, JSON.stringify({
          type: 'init',
          name: this.myName,
          color: this.myColor
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
        } else if (msg.type === 'newTorrent') {
          delete msg.type
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
          this.status = 'Cannot connect to WebTorrent trackers'

          console.error(blah)

          this.$buefy.toast.open({
            message: 'We couldn\'t connect to any WebTorrent trackers. A page refresh might help.\nYour ISP might be blocking them 🤔',
            position: 'is-top',
            type: 'is-danger',
            duration: 6000
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

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400&display=swap');

#app {
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
