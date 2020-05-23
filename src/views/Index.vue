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
    <div id="bg-wrapper">
      <svg id="bg" viewbox="0 0 1170 1170">
        <circle class="circle" cx="570" cy="570" r="500" stroke="rgba(160,160,160,.5)" fill="transparent"></circle>
      </svg>
    </div>
  </div>
</template>

<script>
import { P2PT } from 'p2pt'

export default {
  name: 'Index',

  p2pt: null,

  data () {
    return {
      status: 'ss',

      circles: [
        []
      ]
    }
  },

  methods: {
    init () {
      this.p2pt = new P2PT(this.$GAME_ANNOUNCE_URLS, 'vett')
    }
  },

  components: {

  }
}
</script>

<style scoped>
.navbar {
  background: #209CEE;
  color: #fff;
}

#bg-wrapper {
  position: fixed;
  top: 52px;
  bottom: 0;
  left: 0;
  right: 0;
}

#bg {
  margin: 0 auto;
  width: 100%;
  height: 100%;
}
</style>
