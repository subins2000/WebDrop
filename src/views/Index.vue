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
      status: 'ss'
    }
  },

  methods: {
    init () {
      this.setUpP2PT()
      this.setUpEarth()
    },

    setUpP2PT () {
      this.p2pt = new P2PT(this.$GAME_ANNOUNCE_URLS, 'vett')
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

      let i = 0

      while (curCircleRadius < biggestCircleRadius) {
        this.svg.append('circle')
          .attr('r', curCircleRadius)
          .attr('cx', startingX)
          .attr('cy', startingY)
          .attr('stroke', '#CCC')
          .attr('fill', 'transparent')

        if (i === 0) {
          this.addUserCircle(startingX, startingY)
        }

        curCircleRadius += biggestCircleRadius * 0.15
        i++
      }
    },

    addUserCircle (x, y) {
      const circle = this.svg.append('circle')
        .attr('r', this.userCircleRadius)
        .attr('cx', x)
        .attr('cy', y)
        .attr('stroke', '#CCC')
        .attr('fill', randomColor())
        .addEventListener('click', this.onUserClick)

      this.svg.insert('text')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('x', x)
        .attr('y', y - this.userCircleRadius - 10)
        .text(anonymus.create())
        .addEventListener('click', this.onUserClick)
    },

    onUserClick () {
      
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
