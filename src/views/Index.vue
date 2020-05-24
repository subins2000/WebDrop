<template>
  <div>
    <b-navbar v-if="userSelected === 0" class="navbar has-text-white has-shadow" mobile-burger="false">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <b-button>WebDrop</b-button>
        </b-navbar-item>
      </template>
      <template slot="end">
        <b-navbar-item tag="div" class="has-text-white">
          {{ status }}
        </b-navbar-item>
      </template>
    </b-navbar>
    <b-navbar v-else class="navbar selected has-text-white has-shadow" mobile-burger="false">
      <template slot="brand">
        <b-navbar-item>
          <b-button v-on:click="cancelAllUserSelection">X</b-button>
        </b-navbar-item>
        <b-navbar-item tag="div">
          {{ this.userSelected }} users selected
        </b-navbar-item>
      </template>
      <template slot="end">
        <b-navbar-item tag="router-link" :to="{ path: '/send' }">
          <b-button>Send</b-button>
        </b-navbar-item>
      </template>
    </b-navbar>
    <div id="earth-wrapper">
      <svg id="earth" ref="earth" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  </div>
</template>

<script>
import * as P2PT from 'p2pt'
import * as d3 from 'd3'
import * as anonymus from 'anonymus'
import * as publicIP from 'public-ip'

const randomColor = () => {
  return `hsla(${~~(360 * Math.random())},70%,50%,1)`
}

export default {
  name: 'Index',

  p2pt: P2PT,
  earth: HTMLElement,
  svg: null,

  circleStartingX: 0,
  circleStartingY: 0,
  userCircleRadius: 50,

  data () {
    return {
      status: 'ss',
      myName: anonymus.create(),
      myColor: randomColor(),
      peers: {},
      circleSlots: [],
      circleSlotIndex: 0,
      userSelected: 0
    }
  },

  methods: {
    init () {
      this.setUpP2PT()
      this.setUpEarth()
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
      this.p2pt = new P2PT(this.$ANNOUNCE_URLS, ip)

      this.p2pt.on('peerconnect', (peer) => {
        this.p2pt.send(peer, JSON.stringify({
          type: 'init',
          name: this.myName,
          color: this.myColor
        }))
      })

      this.p2pt.on('msg', (peer, msg) => {
        try {
          msg = JSON.parse(msg)
        } catch (_) {
          return
        }

        if (msg.type === 'init') {
          this.addUser(peer.id, msg.name, msg.color)
        }
      })

      this.p2pt.start()
    },

    addUser (id, name, color) {
      this.peers[id] = {
        name: name,
        color: color
      }

      this.addUserCircle(id, name, color, this.circleSlots[this.circleSlotIndex][0], this.circleSlots[this.circleSlotIndex][1])

      this.circleSlotIndex++
    },

    setUpEarth () {
      this.earth = this.$refs.earth
      this.svg = d3.select(this.earth)

      this.circleStartingX = window.innerWidth / 2
      this.circleStartingY = window.innerHeight - 100

      const biggestCircleRadius = this.circleStartingX

      this.userCircleRadius = biggestCircleRadius * 0.05

      // 10% of biggest circle radius
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
      this.svg.append('circle')
        .attr('class', 'user')
        .attr('id', userID)
        .attr('r', this.userCircleRadius)
        .attr('cx', x)
        .attr('cy', y)
        .attr('stroke', '#CCC')
        .attr('fill', userColor)
        .on('click', this.onUserClick)

      this.svg.append('text')
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

      if (userID === 'me') return

      if (target.classList.contains('selected')) {
        this.earth.querySelectorAll(`[id="${userID}"]`).forEach(elem => {
          elem.classList.remove('selected')
        })
      } else {
        this.earth.querySelectorAll(`[id="${userID}"]`).forEach(elem => {
          elem.classList.add('selected')
        })
      }

      this.userSelected = this.earth.querySelectorAll('.user.selected').length
    },

    cancelAllUserSelection () {
      this.earth.querySelectorAll('.selected').forEach(elem => {
        elem.classList.remove('selected')
      })
      this.userSelected = 0
    }
  },

  mounted () {
    this.init()
  }
}
</script>

<style lang="sass">
.navbar
  background-color: #209CEE !important
  color: #fff

  &.selected
    background-color: #26D985 !important

#earth-wrapper
  position: fixed
  top: 52px
  bottom: 0
  left: 0
  right: 0

#earth
  margin: 0 auto
  width: 100%
  height: 100%
  user-select: none

  .user
    stroke: #000
    stroke-width: 0

    &.selected
      stroke-width: 3px

  .user-text.selected
    font-weight: bold
</style>
