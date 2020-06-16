<template>
  <div>
    <div v-show="!sendScreen && !receiveScreen">
      <b-navbar v-if="userSelectedCount === 0" class="navbar is-info has-text-white" :mobile-burger="false">
        <template slot="brand">
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            <h1 class="is-size-4">WebDrop</h1>
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/about' }">
            How-To
          </b-navbar-item>
        </template>
        <template slot="end">
          <b-navbar-item tag="div" class="has-text-white">
            {{ status }}
          </b-navbar-item>
        </template>
      </b-navbar>
      <b-navbar v-else class="navbar is-success has-text-white has-shadow" :mobile-burger="false">
        <template slot="brand">
          <b-navbar-item>
            <b-button type="is-danger" size="is-medium" v-on:click="cancelAllUserSelection">X</b-button>
          </b-navbar-item>
          <b-navbar-item tag="div">
            {{ userSelectedCount }} users selected
          </b-navbar-item>
          <div class="actions">
            <b-navbar-item tag="router-link" :to="{ path: '/send' }">
              <b-button type="is-primary" size="is-medium">Send</b-button>
            </b-navbar-item>
          </div>
        </template>
      </b-navbar>
      <div id="earth-wrapper">
        <svg id="earth" ref="earth" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient xlink:href="#4" id="3" x1="159.46" y1="668.03" x2="160.66" y2="596.97" gradientUnits="userSpaceOnUse"/><linearGradient id="4"><stop stop-color="#08f"/><stop offset="1" stop-color="#02c3ff"/></linearGradient><linearGradient xlink:href="#4" id="2" x1="159.46" y1="668.03" x2="160.66" y2="596.97" gradientUnits="userSpaceOnUse"/><linearGradient xlink:href="#4" id="0" x1="169.5" y1="624.72" x2="159.24" y2="63.27" gradientUnits="userSpaceOnUse" gradientTransform="matrix(.93022 0 0 .91891 14.815 32.587)"/><linearGradient id="1" x1="8.167" y1="1050.47" x2="8.115" y2="1038.35" gradientUnits="userSpaceOnUse"><stop stop-color="#141414"/><stop offset="1" stop-color="#2d2d2f"/></linearGradient><g id="phone-icon" transform="matrix(.07976 0 0 .06939 11.129.212)"><rect width="292.69" height="525.81" x="18.553" y="87.91" fill="url(#0)" fill-rule="evenodd" rx="9.302"/><path d="m11.404 1037.36h-6.807c-.31 0-.561.251-.561.561v12.877c0 .31.251.561.561.561h6.807c.31 0 .561-.251.561-.561v-12.877c0-.31-.251-.561-.561-.561m-.082 11.778h-6.644v-9.555h6.644z" transform="matrix(42.98335 0 0 49.4146-182.52-51263.92)" fill="url(#1)"/><ellipse cx="161.34" cy="637.98" rx="25.23" ry="29" fill="url(#2)" fill-rule="evenodd" stroke="url(#3)" stroke-linecap="round" stroke-width="7.411"/></g>
            <filter id="shadow" x="-20%" y="-20%" width="200%" height="200%">
              <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
              <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />
              <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import Bowser from 'bowser'
import * as publicIP from 'public-ip'

const randomColor = () => {
  return `hsla(${~~(360 * Math.random())},70%,50%,1)`
}

const getName = () => {
  const bowser = Bowser.getParser(window.navigator.userAgent)

  return `${bowser.getOSName()} ${bowser.getBrowserName()}`
}

export default {
  name: 'Index',

  earth: HTMLElement,
  svg: null,

  circleStartingX: 0,
  circleStartingY: 0,
  userCircleRadius: 50,

  data () {
    return {
      status: 'Connecting...',
      myName: getName(),
      myColor: randomColor(),

      circleSlots: [],

      sendScreen: false,
      receiveScreen: false
    }
  },

  computed: {
    userSelected () {
      return this.$store.state.selectedUsers
    },

    userSelectedCount () {
      return this.userSelected.length
    }
  },

  methods: {
    init () {
      this.setUpP2PT()
      this.setUpEarth()

      this.$store.subscribe((mutation) => {
        if (mutation.type === 'addUser') {
          const slot = this.circleSlots.shift()
          this.addUserCircle(
            mutation.payload.id,
            mutation.payload.name,
            mutation.payload.color,
            slot[0],
            slot[1]
          )

          this.circleSlotIndex++
        } else if (mutation.type === 'removeUser') {
          const userID = mutation.payload
          const elem = this.earth.querySelector(`.user[id="${userID}"]`)

          const item = [elem.getAttribute('cx'), elem.getAttribute('cy')]
          this.circleSlots.push(item)

          this.earth.querySelector(`.user-text[id="${userID}"]`).remove()
          elem.remove()
        }
      })
    },

    setUpP2PT () {
      publicIP.v4().then((ip) => {
        this.startP2PT(ip)
      }).catch(error => {
        console.log(error)
        this.status = 'Could not find your IP address'
      })
    },

    startP2PT (ip) {
      this.$p2pt.setIdentifier(ip)

      this.$p2pt.on('peerconnect', (peer) => {
        this.status = ''
        this.$p2pt.send(peer, JSON.stringify({
          type: 'init',
          name: this.myName,
          color: this.myColor
        }))
      })

      this.$p2pt.on('msg', (peer, msg) => {
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
        } else if (msg.type === 'send') {
          this.$buefy.dialog.confirm({
            message: `${this.$store.state.users[peer.id].name} wants to send you file <b class="is-bold">${msg.name}</b>`,
            onConfirm: () => {
              this.receiveFile(msg.name, msg.infoHash)
            }
          })
        }
      })

      this.$p2pt.on('peerclose', (peer) => {
        this.$store.commit('removeUser', peer.id)
      })

      let warningCount = 0
      this.$p2pt.on('trackerwarning', (blah, stats) => {
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

      this.$p2pt.on('trackerconnect', () => {
        this.status = 'Connected!'
        warningCount--
      })

      this.$p2pt.start()
    },

    receiveFile (name, infoHash) {
      this.$store.commit('receiveFile', {
        infoHash,
        name
      })
      this.sendScreen = false
      this.receiveScreen = true
    },

    setUpEarth () {
      this.earth = this.$refs.earth
      this.svg = d3.select(this.earth)

      const canvasSize = [window.innerWidth, window.innerHeight]

      this.svg.attr('viewBox', `0 0 ${canvasSize[0]} ${canvasSize[1]}`)

      this.circleStartingX = canvasSize[0] / 2
      this.circleStartingY = canvasSize[1] - canvasSize[1] * 0.1

      const biggestCircleRadius = Math.max(canvasSize[0] / 2, canvasSize[1])

      // 5% of width
      this.userCircleRadius = canvasSize[1] * 0.05

      let curCircleRadius = this.userCircleRadius

      let i = 0
      while (curCircleRadius < biggestCircleRadius) {
        this.svg.append('circle')
          .attr('r', curCircleRadius)
          .attr('cx', this.circleStartingX)
          .attr('cy', this.circleStartingY)
          .attr('stroke', '#CCC')
          .attr('fill', 'transparent')

        if (i > 1) {
          this.circleSlots.push(
            [this.circleStartingX, this.circleStartingY - curCircleRadius]
          )
          this.circleSlots.push(
            [this.circleStartingX + curCircleRadius * Math.cos(10), this.circleStartingY + curCircleRadius * Math.sin(10)]
          )
          this.circleSlots.push(
            [this.circleStartingX - curCircleRadius * Math.cos(10), this.circleStartingY + curCircleRadius * Math.sin(10)]
          )
        }

        curCircleRadius += biggestCircleRadius * 0.15
        i++
      }

      this.addUserCircle('me', this.myName, this.myColor, this.circleStartingX, this.circleStartingY)
    },

    addUserCircle (userID, userName, userColor, x, y) {
      const group = this.svg.append('g')

      group.append('circle')
        .attr('class', 'user')
        .attr('id', userID)
        .attr('r', this.userCircleRadius)
        .attr('cx', x)
        .attr('cy', y)
        .attr('stroke', '#CCC')
        .attr('fill', userColor)
        .attr('filter', 'url(#shadow)')
        .on('click', this.onUserClick)

      const mid = this.userCircleRadius / 2
      group.append('use')
        .attr('xlink:href', '#phone-icon')
        .attr('height', this.userCircleRadius)
        .attr('x', x - mid)
        .attr('y', y - mid)

      group.append('text')
        .attr('class', 'user-text')
        .attr('id', userID)
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('x', x)
        .attr('y', y - this.userCircleRadius - 10)
        .text(userName)
        .on('click', this.onUserClick)
    },

    onUserClick () {
      const target = d3.event.target
      const userID = target.id

      // if (userID === 'me') return

      if (target.classList.contains('selected')) {
        this.$store.commit('deselectUser', userID)

        this.earth.querySelectorAll(`[id="${userID}"]`).forEach(elem => {
          elem.classList.remove('selected')
        })
      } else {
        this.$store.commit('selectUser', userID)

        this.earth.querySelectorAll(`[id="${userID}"]`).forEach(elem => {
          elem.classList.add('selected')
        })
      }
    },

    cancelAllUserSelection () {
      this.sendScreen = false
      this.receiveScreen = false
      this.userSelected = []

      this.earth.querySelectorAll('.selected').forEach(elem => {
        elem.classList.remove('selected')
      })
    }
  },

  mounted () {
    this.init()
  }
}
</script>

<style lang="sass">
.navbar
  padding-top: 10px
  padding-bottom: 10px
  transition: 0.2s all

  &.has-shadow
    box-shadow: 0 5px 30px 0 #AAA !important

  // disable start & end and only use brand
  .navbar-brand
    width: 100%

  .actions
    display: flex
    align-items: stretch
    justify-content: flex-end
    margin-left: auto

#earth-wrapper
  position: fixed
  top: 52px
  bottom: 0
  left: 0
  right: 0

#earth
  margin: 0 auto
  width: 100%
  max-height: 100%
  user-select: none

  .user
    stroke: #000
    stroke-width: 0

    &.selected
      stroke-width: 3px

  .user-text.selected
    font-weight: bold

.container
  padding: 20px 0

@media screen and (max-width: 960px)
  .container
    padding: 20px 5%

@media screen and (min-width: 900px)
  .container
    max-width: 900px
</style>
