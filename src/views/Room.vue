<template>
  <div class="container">
    <center>
      <b-tabs v-model="activeTab" type="is-boxed" expanded>
        <b-tab-item label="Invite People" class="content">
          <p>Share the room code <b class="is-size-4">{{ roomID }}</b> or this link with people you want to share stuff with :</p>
          <div class="control is-expanded">
            <input class="input is-info is-medium is-flat" onclick="this.select()" v-bind:value='internetInviteLink' readonly />
          </div><br/>
          <div class="control">
            <span class="button is-info is-primary is-medium" @click="copyInviteLink" v-clipboard="internetInviteLink" style="width: 100%;">Copy</span>
          </div><br/>
          <img aria-label="Qr Code Image" v-bind:src="qrURL" />
          <p>Or scan the above Qr Code</p>
        </b-tab-item>
        <b-tab-item label="Join Room" class="content">
          <p>Room code is a <b>{{ $INTERNET_ROOM_CODE_LENGTH }}</b> letter word</p>
          <div class="control is-expanded">
            <input class="input is-info is-medium is-flat" placeholder="Paste the room code here" v-model="internetRoomInput" v-on:keyup.enter="onJoinClick" />
          </div><br/>
          <div class="button is-info is-medium" @click="onJoinClick" style="width: 100%;">Join</div>
        </b-tab-item>
      </b-tabs>
    </center>
  </div>
</template>

<script>
import QrCreator from 'qr-creator'

export default {
  name: 'Room',

  data () {
    return {
      activeTab: 0,
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

  watch: {
    roomID () {
      this.makeQr()
    }
  },

  methods: {
    init () {
      this.makeQr()
    },

    copyInviteLink () {
      this.$buefy.toast.open({
        duration: 2000,
        message: 'Invite Link Copied !',
        position: 'is-top',
        type: 'is-primary'
      })
    },

    onJoinClick () {
      if (!this.$validateRoomCode(this.internetRoomInput)) {
        this.$store.dispatch('invalidRoomCode')
      } else if (Object.keys(this.$store.state.users).length > 0) {
        this.$buefy.snackbar.open({
          message: 'Joining another room will remove all your current connected devices. Proceed ?',
          type: 'is-success',
          position: 'is-top',
          indefinite: false,
          queue: false,
          actionText: 'Yes',
          onAction: () => {
            this.joinInternetRoom()
          }
        })
      } else {
        this.joinInternetRoom()
      }
    },

    joinInternetRoom () {
      this.$store.commit('activateInternetShare', this.internetRoomInput)

      this.activeTab = 0
      this.$router.push('/')

      this.makeQr()
    },

    makeQr () {
      const canvas = document.createElement('canvas')
      QrCreator.render({
        text: this.internetInviteLink,
        radius: 0.5, // 0.0 to 0.5
        ecLevel: 'Q', // L, M, Q, H
        fill: '#000', // foreground color
        background: null, // color or null for transparent
        size: 128 // in pixels
      }, canvas)
      this.qrURL = canvas.toDataURL()
    }
  },

  mounted () {
    this.init()
  }
}
</script>

<style lang="sass">
.control .help.counter
  float: right
  margin-left: .5em
</style>
