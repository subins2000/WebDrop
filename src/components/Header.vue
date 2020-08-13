<template>
  <div>
    <b-navbar v-if="$route.name !== 'About'" class="is-success has-shadow" :mobile-burger="false" :transparent="true">
      <template slot="brand">
        <b-navbar-item id="brand" tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <div class="actions">
          <b-tooltip :label="internetShare ? 'Joined An Internet Share Room' : 'Share via Internet'" position="is-bottom" :type="internetShare ? 'is-info' : 'is-primary'">
            <b-navbar-item tag="router-link" :to="{ path: '/room' }">
              <a class="button is-text" v-bind:class="{ 'is-info' : internetShare }" :aria-label="internetShare ? 'Joined An Internet Share Room' : 'Share via Internet'">
                <earth-icon class="icon is-medium"></earth-icon>
              </a>
            </b-navbar-item>
          </b-tooltip>
          <b-tooltip label="Settings" position="is-bottom" type="is-dark">
            <b-navbar-item tag="router-link" :to="{ path: '/settings' }" title="Settings">
              <cog-icon class="icon is-medium has-text-dark"></cog-icon>
            </b-navbar-item>
          </b-tooltip>
          <b-navbar-item tag="router-link" :to="{ path: '/about' }">
            <b-button type="is-warning">Help</b-button>
          </b-navbar-item>
        </div>
      </template>
    </b-navbar>
    <b-navbar v-else class="navbar is-warning has-text-white" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/grid' }">
          Grid
        </b-navbar-item>
      </template>
    </b-navbar>
  </div>
</template>

<script>
import CogIcon from 'vue-material-design-icons/Cog.vue'
import EarthIcon from 'vue-material-design-icons/Earth.vue'

export default {
  name: 'Header',

  components: {
    CogIcon,
    EarthIcon
  },

  computed: {
    internetShare () {
      return this.$store.state.internetShare
    }
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

  &.is-info.has-shadow
    box-shadow: 0 5px 30px 0 #AAA !important

  .actions
    display: flex
    align-items: stretch
    justify-content: flex-end
    margin-left: auto

    a
      color: #fff

.navbar-item
  background: none
  outline: none

.main-navbar .navbar-brand
  width: auto

@media screen and (max-width: 460px)
  #brand
    padding: 0.5rem 0.25rem

  .actions .navbar-item
    padding: 0.5rem 0.5rem
</style>
