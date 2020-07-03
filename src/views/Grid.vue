<template>
  <div>
    <div>
      <b-navbar v-if="userSelectedCount === 0" class="navbar is-info main-navbar has-text-white">
        <template slot="brand">
          <b-navbar-item tag="router-link" :to="{ path: '/' }">
            <h1 class="is-size-4">WebDrop</h1>
          </b-navbar-item>
          <b-navbar-item>
            Grid
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
import * as d3 from 'd3'

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
      this.setUpEarth()

      this.$store.subscribe((mutation) => {
        if (mutation.type === 'addUser') {
          this.addUser(mutation.payload)
        } else if (mutation.type === 'removeUser') {
          this.removeUser(mutation.payload)
        }
      })

      for (const userID in this.$store.state.users) {
        let user = this.$store.state.users[userID]
        user = { ...user, ...{ id: userID } }
        this.addUser(user)
      }
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

      this.addUserCircle('me', this.$store.state.myName, this.$store.state.myColor, this.circleStartingX, this.circleStartingY)
    },

    addUser (user) {
      const slot = this.circleSlots.shift()
      this.addUserCircle(
        user.id,
        user.name,
        user.color,
        slot[0],
        slot[1]
      )

      this.circleSlotIndex++
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

    removeUser (userID) {
      const elem = this.earth.querySelector(`.user[id="${userID}"]`)

      if (elem) {
        const item = [elem.getAttribute('cx'), elem.getAttribute('cy')]
        this.circleSlots.push(item)

        elem.remove()
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

    a
      color: #fff

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
