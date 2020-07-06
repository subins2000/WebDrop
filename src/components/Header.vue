<template>
  <div>
    <b-navbar v-if="$route.name !== 'About'" class="is-success has-shadow" :mobile-burger="false" :transparent="true">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/grid' }">
          <span class="is-size-6">Grid</span>
        </b-navbar-item>
        <div class="actions">
          <b-tooltip :label="internetShare ? 'Joined An Internet Share Room' : 'Share via Internet'" position="is-bottom" :type="internetShare ? 'is-warning' : 'is-primary'">
            <b-navbar-item tag="div" @click="shareViaInternet">
              <b-button :type="internetShare ? 'is-warning' : 'is-text'"><img src="img/web.png" height="100%" /></b-button>
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
    <b-modal :active.sync="internetShareModelActive" class="has-text-centered">
      <div class="card">
        <div class="card-content content">
          <b-tabs v-model="internetShareModelActiveTab" type="is-info">
            <b-tab-item label="Invite People">
              <p>Share this room code with people you want to share stuff with :</p>
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
              <input class="input is-info is-medium is-flat" v-model="internetRoomInput" v-on:keyup.enter="joinInternetRoom" /><br/><br/>
              <div class="button is-info is-medium" @click="joinInternetRoom" style="width: 100%;">Join</div>
            </b-tab-item>
          </b-tabs>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'Header',

  data () {
    return {
      internetShareModelActive: false,
      internetShareModelActiveTab: 0,
      internetRoomInput: ''
    }
  },

  computed: {
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
        this.$buefy.toast.open({
          duration: 2000,
          message: 'Invalid Room Code',
          position: 'is-top',
          type: 'is-danger',
          queue: false
        })
        return
      }
      this.$store.commit('activateInternetShare', this.internetRoomInput)

      this.$buefy.toast.open({
        duration: 4000,
        message: `Joined Room <b>${this.internetRoomInput}</b>`,
        position: 'is-top',
        type: 'is-warning'
      })
      this.internetShareModelActive = false
    }
  },

  mounted () {
    const roomID = this.$route.query.room
    if (roomID) {
      this.internetRoomInput = roomID
      this.joinInternetRoom()
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

.main-navbar .navbar-brand
  width: auto
</style>
