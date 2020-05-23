<template>
  <div>
    <b-navbar class="navbar has-text-white has-shadow">
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
  return `hsla(${~~(360 * Math.random())},70%,50%,0.8)`
}

export default {
  name: 'Index',

  p2pt: P2PT,
  earth: HTMLElement,
  svg: null,

  userCircleRadius: 50,

  data () {
    return {
      status: 'ss',
      myName: anonymus.create(),
      myColor: randomColor(),
      peers: {}
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

      console.log(id)

      this.addUserCircle(id, name, color, 100, 100)
    },

    setUpEarth () {
      this.earth = this.$refs.earth
      this.svg = d3.select(this.earth)

      const startingX = window.innerWidth / 2
      const startingY = window.innerHeight - 100

      const biggestCircleRadius = startingX

      this.userCircleRadius = biggestCircleRadius * 0.05

      // 10% of biggest circle radius
      let curCircleRadius = this.userCircleRadius

      while (curCircleRadius < biggestCircleRadius) {
        this.svg.append('circle')
          .attr('r', curCircleRadius)
          .attr('cx', startingX)
          .attr('cy', startingY)
          .attr('stroke', '#CCC')
          .attr('fill', 'transparent')

        curCircleRadius += biggestCircleRadius * 0.15
      }

      this.addUserCircle('me', this.myName, this.myColor, startingX, startingY)
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
      console.log('a')
    }
  },

  mounted () {
    this.init()
  }
}
</script>

<style scoped>
.navbar {
  background: #209CEE;
  color: #fff;
}

#earth-wrapper {
  position: fixed;
  top: 52px;
  bottom: 0;
  left: 0;
  right: 0;
}

#earth {
  margin: 0 auto;
  width: 100%;
  height: 100%;
}
</style>
