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
              <a class="button is-text" v-bind:class="{ 'is-warning' : internetShare }" :aria-label="internetShare ? 'Joined An Internet Share Room' : 'Share via Internet'">
                <earth-icon class="icon is-medium"></earth-icon>
              </a>
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
          <b-tabs v-model="internetShareModelActiveTab" type="is-boxed" expanded>
            <b-tab-item label="Invite People">
              <div class="side-items">
                <div class="side-item" style="flex-grow: 1;padding: 0 10px;">
                  <img aria-label="Qr Code Image" v-bind:src="qrURL" />
                </div>
                <div class="side-item" style="flex-grow: 5">
                  <p>Share the room code <b class="is-size-4">{{ roomID }}</b> or this link with people you want to share stuff with :</p>
                  <b-field grouped group-multiline>
                    <div class="control is-expanded">
                      <input class="input is-info is-medium is-flat" onclick="this.select()" v-bind:value='internetInviteLink' readonly />
                    </div>
                    <div class="control">
                      <span class="button is-info is-primary is-medium" @click="copyInviteLink" v-clipboard="internetInviteLink" style="width: 100%">Copy</span>
                    </div>
                  </b-field>
                </div>
              </div>
            </b-tab-item>
            <b-tab-item label="Join Room">
              <input class="input is-info is-medium is-flat" placeholder="Paste the room code here" v-model="internetRoomInput" v-on:keyup.enter="onJoinClick" /><br/><br/>
              <div class="button is-info is-medium" @click="onJoinClick" style="width: 100%;">Join</div>
            </b-tab-item>
          </b-tabs>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import EarthIcon from 'vue-material-design-icons/Earth.vue'
import QrCreator from 'qr-creator'

export default {
  name: 'Header',

  components: {
    EarthIcon
  },

  data () {
    return {
      internetShareModelActive: false,
      internetShareModelActiveTab: 0,
      internetRoomInput: '',

      qrURL: ''
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

      this.makeQr()
    },

    copyInviteLink () {
      this.$buefy.toast.open({
        duration: 2000,
        message: 'Invite Link Copied !',
        position: 'is-top',
        type: 'is-success'
      })
    },

    onJoinClick () {
      if (this.internetRoomInput.length !== this.$INTERNET_ROOM_CODE_LENGTH) {
        this.$buefy.toast.open({
          duration: 2000,
          message: 'Invalid Room Code',
          position: 'is-top',
          type: 'is-danger',
          queue: false
        })
      } else if (Object.keys(this.$store.state.users).length > 0) {
        this.$buefy.snackbar.open({
          message: 'Joining another room will remove all your current connected devices. Proceed ?',
          type: 'is-success',
          position: 'is-top',
          indefinite: true,
          queue: false,
          actionText: 'Yes',
          onAction: () => {
            this.joinInternetRoom()
          }
        })
      }
    },

    joinInternetRoom () {
      this.$store.commit('activateInternetShare', this.internetRoomInput)

      this.$buefy.toast.open({
        duration: 4000,
        message: `Joined Room <b>${this.internetRoomInput}</b>`,
        position: 'is-top',
        type: 'is-warning'
      })
      this.internetShareModelActive = false

      this.makeQr()
    },

    makeQr () {
      const canvas = document.createElement('canvas')
      QrCreator.render({
        text: this.internetInviteLink,
        radius: 0.5, // 0.0 to 0.5
        ecLevel: 'Q', // L, M, Q, H
        fill: '#536DFE', // foreground color
        background: null, // color or null for transparent
        size: 128 // in pixels
      }, canvas)
      this.qrURL = canvas.toDataURL()
    }
  },

  mounted () {
    const roomID = this.$route.query.room
    if (roomID) {
      this.internetRoomInput = roomID
      this.onJoinClick()
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

.side-items
  display: flex
  align-items: center

.side-item
  flex-grow: 1
</style>
