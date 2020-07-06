<template>
  <div id="app">
    <Header />
    <transition name='slide-fade'>
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

      this.$root.$on('ping', (users) => {
        const data = {
          type: 'ping'
        }
        for (const user of users) {
          this.$store.state.p2pt.send(user.conn, JSON.stringify(data))
        }
      })
    },

    setUpP2PT () {
      // for testing purposes
      // this.startP2PT('a')
      publicIP.v4().then((ip) => {
        const roomID = hashSum(ip).substr(0, this.$INTERNET_ROOM_CODE_LENGTH)
        this.$store.commit('setRoom', roomID)
        this.startP2PT(roomID)
      }).catch(error => {
        console.log(error)
        this.$buefy.snackbar.open({
          message: 'Could not find your IP address',
          position: 'is-top',
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
        } else if (msg.type === 'msg') {
          delete msg.type

          msg.name = this.$store.state.users[peer.id].name
          msg.color = this.$store.state.users[peer.id].color

          this.$store.commit('addMessage', msg)
        }
      })

      p2pt.on('peerclose', (peer) => {
        this.$store.commit('removeUser', peer.id)
      })

      let warningCount = 0
      let trackerConnected = false
      p2pt.on('trackerwarning', (blah, stats) => {
        warningCount++

        if (warningCount >= stats.total && !trackerConnected) {
          console.log(blah)

          this.$buefy.snackbar.open({
            message: 'We couldn\'t connect to any WebTorrent trackers. Your ISP might be blocking them 🤔',
            position: 'is-top',
            type: 'is-danger',
            queue: true,
            indefinite: true,
            actionText: 'Retry',
            onAction: () => {
              if (!trackerConnected) {
                this.$store.commit('destroyP2PT')
                this.startP2PT(identifier)
              }
            }
          })
        }
      })

      p2pt.on('trackerconnect', () => {
        trackerConnected = true
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
// @import url('https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400&display=swap');

#app {
  font-family: 'Ubuntu', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

// Import Bulma's core
@import "~bulma/sass/utilities/_all";

// Set your colors
$primary: #8c67ef;
$primary-invert: findColorInvert($primary);
$twitter: #4099FF;
$twitter-invert: findColorInvert($twitter);

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: (
    "white": ($white, $black),
    "black": ($black, $white),
    "light": ($light, $light-invert),
    "dark": ($dark, $dark-invert),
    "primary": ($primary, $primary-invert),
    "info": ($info, $info-invert),
    "success": ($success, $success-invert),
    "warning": ($warning, $warning-invert),
    "danger": ($danger, $danger-invert),
    "twitter": ($twitter, $twitter-invert)
);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// For buefy
$speed-slow: 150ms !default
$speed-slower: 250ms !default

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/utils/_animations.scss";
@import "~buefy/src/scss/utils/_functions.scss";

@import "~buefy/src/scss/components/_checkbox.scss";
@import "~buefy/src/scss/components/_modal.scss";
@import "~buefy/src/scss/components/_notices.scss";
@import "~buefy/src/scss/components/_progress.scss";
@import "~buefy/src/scss/components/_tabs.scss";

@import "~buefy/src/scss/components/_table.scss";

@import "~buefy/src/scss/components/_tooltip.scss";
@import "~buefy/src/scss/components/_upload.scss";

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
  position: absolute;
  left: 0;
  right: 0;
}
</style>
