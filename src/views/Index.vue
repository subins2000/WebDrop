<template>
  <div>
    <div>
      <b-navbar v-if="userSelectedCount === 0" class="navbar is-info main-navbar has-text-white">
        <template slot="brand">
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            <h1 class="is-size-4">WebDrop</h1>
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/shares' }">
            Shares
          </b-navbar-item>
          <b-navbar-item tag="router-link" :to="{ path: '/about' }">
            How-To
          </b-navbar-item>
        </template>
        <template slot="end">
          <b-navbar-item tag="div" @click="shareViaInternet">
            <b-button type="is-primary">Share Via Internet 🌐</b-button>
          </b-navbar-item>
          <b-navbar-item tag="div">
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
    <b-modal :active.sync="internetShareModelActive" class="has-text-centered">
      <div class="card">
        <div class="card-content content">
          <b-tabs v-model="internetShareModelActiveTab" type="is-info">
            <b-tab-item label="Invite People">
              <p>Share this room code with people you want to share files with :</p>
              <pre class="is-size-4">{{ roomID }}</pre>
              <h3 style="margin-top: 0">OR</h3>
              <p>Share this link</p>
              <div class="columns">
                <div class="column is-four-fifths">
                  <input class="input is-info is-medium is-flat" onclick="this.select()" v-bind:value='internetInviteLink' readonly />
                </div>
                <div class="column">
                  <span class="button is-info is-primary is-medium" @click="copyInviteLink" v-clipboard="internetInviteLink" style="width: 100%">Copy</span>
                </div>
              </div>
            </b-tab-item>
            <b-tab-item label="Join Room">
              <p>Paste the room code here :</p>
              <input class="input is-info is-medium is-flat" v-model='internetRoomInput' /><br/><br/>
              <div class="button is-info is-medium" @click="joinInternetRoom" style="width: 100%;">Join</div>
            </b-tab-item>
          </b-tabs>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import * as P2PT from 'p2pt'
import * as d3 from 'd3'
import Bowser from 'bowser'
import * as publicIP from 'public-ip'
import * as hashSum from 'hash-sum'

const getAColor = () => {
  // l in 'hsla' stands for lightness
  return `hsla(${~~(360 * Math.random())},70%,60%,1)`
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
      myColor: null,

      circleSlots: [],

      internetShareModelActive: false,
      internetShareModelActiveTab: 0,
      internetRoomInput: ''
    }
  },

  computed: {
    userSelected () {
      return this.$store.state.selectedUsers
    },

    userSelectedCount () {
      return this.userSelected.length
    },

    internetShare () {
      return this.$store.state.internetShare
    },

    roomID () {
      return this.$store.state.roomID
    },

    internetInviteLink () {
      return this.$INTERNET_ROOM_SHARE_LINK + this.roomID
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
      this.setUpEarth()

      this.$store.subscribe((mutation) => {
        if (mutation.type === 'addUser') {
          console.log(mutation)
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

          if (elem) {
            const item = [elem.getAttribute('cx'), elem.getAttribute('cy')]
            this.circleSlots.push(item)

            elem.remove()
          }
        } else if (mutation.type === '') {

        }
      })
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
      if (this.$p2pt) {
        this.$p2pt.destroy()
      }
      this.$p2pt = new P2PT(this.$ANNOUNCE_URLS)
      this.$p2pt.setIdentifier('webdrop' + identifier)

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
        } else if (msg.type === 'newTorrent') {
          delete msg.type
          this.$store.commit('newTorrent', msg)
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

    shareViaInternet () {
      let roomID = this.roomID
      if (!roomID) {
        roomID = Math.random().toString(36).substr(2, this.$INTERNET_ROOM_CODE_LENGTH)
        this.$store.commit('activateInternetShare', roomID)

        this.startP2PT(roomID)
      }

      this.internetShareModelActive = true
    },

    copyInviteLink () {
      this.$buefy.toast.open({
        duration: 2000,
        message: 'Invite Link Copied !',
        position: 'is-top',
        type: 'is-success'
      })
    },

    joinInternetRoom () {
      if (this.internetRoomInput.length !== this.$INTERNET_ROOM_CODE_LENGTH) {
        return
      }
      this.$store.commit('activateInternetShare', this.internetRoomInput)

      this.startP2PT(this.internetRoomInput)

      this.$buefy.toast.open({
        duration: 2000,
        message: `Joined Room ${this.internetRoomInput}`,
        position: 'is-top',
        type: 'is-success'
      })
      this.internetShareModelActive = false
    },

    receiveFile (name, infoHash) {
      this.$store.commit('receiveFile', {
        infoHash,
        name
      })
      this.$router.push('/receive')
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
      const elem = this.earth.querySelector(`.user[id="${userID}"]`)

      if (elem) return

      const group = this.svg.append('g')

      group
        .attr('class', 'user')
        .attr('id', userID)
        .on('click', this.onUserClick)

      group.append('circle')
        .attr('r', this.userCircleRadius)
        .attr('cx', x)
        .attr('cy', y)
        .attr('stroke', '#CCC')
        .attr('fill', userColor)
        .attr('filter', 'url(#shadow)')

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
    },

    onUserClick () {
      const user = d3.event.target.parentElement
      const userID = user.id

      if (userID === 'me') return

      if (user.classList.contains('selected')) {
        this.$store.commit('deselectUser', userID)

        user.classList.remove('selected')
      } else {
        this.$store.commit('selectUser', userID)

        user.classList.add('selected')
      }
    },

    cancelAllUserSelection () {
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

.main-navbar .navbar-brand
  width: auto

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
      circle
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
