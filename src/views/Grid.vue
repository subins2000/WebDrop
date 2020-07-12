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
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="earth" ref="earth" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="200%" height="200%">
            <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
            <feGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />
            <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
          </filter>
          <animate v-if="$store.state.settings.anim" id="searchCircleAnim" xlink:href="#search-circle" attributeName="r" v-bind:from="radarFromVal" v-bind:to="radarToVal" dur="6s" begin="2s;searchCircleAnim.end+2s" restart="whenNotActive" />
          <radialGradient id="searchCircleGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="70%" style="stop-color:rgb(255,255,255);
            stop-opacity:0" />
            <stop offset="100%" style="stop-color: #209cee;stop-opacity: 1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Index',

  earth: HTMLElement,
  svg: null,

  circleStartingX: 0,
  circleStartingY: 0,
  userCircleRadius: 0,

  data () {
    return {
      circleSlots: [],

      radarFromVal: 0,
      radarToVal: 0
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
      const users = []
      for (const userID of this.$store.state.selectedUsers) {
        users.push(this.$store.state.users[userID])
      }
      this.$root.$emit('ping', users)
    },

    makeSVGNode (node, attr) {
      node = document.createElementNS('http://www.w3.org/2000/svg', node)
      for (const [name, value] of Object.entries(attr)) {
        node.setAttributeNS(null, name, value)
      }
      return node
    },

    setUpEarth () {
      this.earth = this.$refs.earth
      this.svg = this.earth

      const canvasSize = [window.innerWidth, window.innerHeight]

      this.svg.setAttribute('viewBox', `0 0 ${canvasSize[0]} ${canvasSize[1]}`)

      this.circleStartingX = canvasSize[0] / 2
      this.circleStartingY = canvasSize[1] - canvasSize[1] * 0.1

      // animating circle
      const c = this.makeSVGNode('circle', {
        r: '0',
        cx: this.circleStartingX,
        cy: this.circleStartingY,
        stroke: '#209cee',
        fill: 'url(#searchCircleGradient)',
        id: 'search-circle'
      })
      this.svg.appendChild(c)

      const biggestCircleRadius = Math.max(canvasSize[0] / 2, canvasSize[1])

      // 5% of width
      this.userCircleRadius = canvasSize[1] * 0.03

      this.radarFromVal = this.userCircleRadius
      this.radarToVal = biggestCircleRadius + biggestCircleRadius * 0.5

      let curCircleRadius = this.userCircleRadius

      let i = 0
      while (curCircleRadius < biggestCircleRadius) {
        this.svg.appendChild(this.makeSVGNode('circle', {
          r: curCircleRadius,
          cx: this.circleStartingX,
          cy: this.circleStartingY,
          stroke: '#CCC',
          fill: 'transparent'
        }))

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

      this.addUserCircle('me', this.$store.state.settings.name, this.$store.state.settings.color, this.circleStartingX, this.circleStartingY)
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

      const group = this.makeSVGNode('g', {
        class: 'user',
        id: userID,
        slotindex: slotIndex
      })
      group.addEventListener('click', this.onUserClick)

      const c = this.makeSVGNode('circle', {
        r: this.userCircleRadius,
        cx: x,
        cy: y,
        stroke: '#CCC',
        fill: userColor,
        filter: 'url(#shadow)'
      })
      group.appendChild(c)

      const t = this.makeSVGNode('text', {
        class: 'user-text',
        id: userID,
        'dominant-baseline': 'middle',
        'text-anchor': 'middle',
        x,
        y: y - this.userCircleRadius - 10
      })
      t.textContent = userName

      group.appendChild(t)
      this.svg.appendChild(group)
    },

    onUserClick (e) {
      const user = e.target.parentElement
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

    animation-duration: 0.5s
    animation-name: popUp

    &.selected
      circle
        stroke-width: 3px
        stroke: #000

  .user-text.selected
    font-weight: bold

@keyframes popUp
  from
    opacity: 0

  to
    opacity: 1
</style>
