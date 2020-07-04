<template>
  <div>
    <b-navbar v-if="userSelectedCount > 0" class="navbar is-info is-fixed-top has-text-white has-shadow" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item>
          <b-button type="is-danger" size="is-medium" v-on:click="cancelAllUserSelection">X</b-button>
        </b-navbar-item>
        <b-navbar-item tag="div">
          {{ userSelectedCount }} user{{ userSelectedCount > 1 ? 's' : '' }} selected
        </b-navbar-item>
        <div class="actions">
          <b-navbar-item tag="div" @click="ping">
            <b-button type="is-warning" size="is-medium">Ping!</b-button>
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
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'Index',

  earth: HTMLElement,
  svg: null,

  circleStartingX: 0,
  circleStartingY: 0,
  userCircleRadius: 0,

  data () {
    return {
      status: 'Connecting...',

      circleSlots: []
    }
  },

  computed: {
    userSelectedCount () {
      return this.$store.state.selectedUsers.length
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

      // for testing many users on grid
      // for (let i = 0; i < 18; i++) {
      //  this.addUser({
      //    id: '1a' + i,
      //    name: 'Linux Firefox',
      //    color: `hsla(${~~(360 * Math.random())},60%,60%,1)`
      //   })
      // }
    },

    ping () {
      const data = {
        type: 'ping'
      }
      for (const userID of this.$store.state.selectedUsers) {
        const user = this.$store.state.users[userID]
        this.$store.state.p2pt.send(user.conn, JSON.stringify(data))
      }
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
      this.userCircleRadius = canvasSize[1] * 0.03

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
          let deg = (Math.PI / 4)

          if (i > 2) {
            deg += (deg / 3)
          }

          if (i > 3) {
            deg += deg / (2 ^ i)
          }

          this.circleSlots.push(
            [this.circleStartingX, this.circleStartingY - curCircleRadius, false]
          )
          this.circleSlots.push(
            [this.circleStartingX + curCircleRadius * Math.cos(deg), this.circleStartingY - curCircleRadius * Math.sin(deg), false]
          )
          this.circleSlots.push(
            [this.circleStartingX - curCircleRadius * Math.cos(deg), this.circleStartingY - curCircleRadius * Math.sin(deg), false]
          )
        }

        curCircleRadius += biggestCircleRadius * 0.10
        i++
      }

      this.addUserCircle('me', this.$store.state.myName, this.$store.state.myColor, this.circleStartingX, this.circleStartingY)
    },

    addUser (user) {
      let slot, slotIndex

      // find free slot
      for (slotIndex in this.circleSlots) {
        slot = this.circleSlots[slotIndex]
        // not occupied
        if (slot[2] === false) break
      }

      slot[2] = true
      this.addUserCircle(
        user.id,
        user.name,
        user.color,
        slot[0],
        slot[1],
        slotIndex
      )
    },

    addUserCircle (userID, userName, userColor, x, y, slotIndex) {
      const elem = this.earth.querySelector(`.user[id="${userID}"]`)

      if (elem) return

      const group = this.svg.append('g')

      group
        .attr('class', 'user')
        .attr('id', userID)
        .attr('slotindex', slotIndex)
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
        const slot = this.circleSlots[elem.getAttribute('slotindex')]

        // make it not occupied
        slot[2] = false

        elem.remove()
      }
    },

    cancelAllUserSelection () {
      this.$store.commit('clearSelectedUsers')

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
        stroke: #000

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
