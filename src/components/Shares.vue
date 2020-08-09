<template>
  <div>
    <div class="container">
      <b-tabs v-model="activeTab" type="is-boxed" expanded>
        <b-tab-item label="Files" v-bind:class="{ noanim: !$store.state.settings.anim }">
          <template slot="header">
            <file-multiple-icon class="icon is-small"></file-multiple-icon>
            <span><span class="icon-text">Files</span> <b-tag class="countTag" v-bind:class="{ 'is-danger': glowFilesBtn }" rounded>{{ shares.length }}</b-tag> </span>
          </template>
          <!-- using class for purgecss to detect -->
          <div class="field content is-grouped is-grouped-multiline">
            <div class="control">
              <b-upload v-model="files" :multiple="true" @input="onFileChange">
                <a class="button is-info" aria-label="Add File/Folder" title="Add File/Folder">
                  <file-upload-icon class="icon is-small"></file-upload-icon>
                  <span class="icon-text">Add File</span>
                </a>
              </b-upload>
            </div>
            <div class="control" id="shareButtons" v-show="tableCheckedRows.length > 0">
              <div class="control" v-if="tableCheckedRows.length === 1">
                <b-field grouped>
                  <div class="control" v-if="!tableCheckedRows[0].mine && tableCheckedRows[0].paused">
                    <b-button @click="resumeShare">Start</b-button>
                  </div>
                  <div class="control">
                    <b-button type="is-danger" @click="removeShare">Remove</b-button>
                  </div>
                </b-field>
              </div>
              <div class="control" v-else>
                <b-field grouped>
                  <div class="control">
                    <b-button @click="resumeShare">Start</b-button>
                  </div>
                  <div class="control">
                    <b-button type="is-danger" @click="removeShare">Remove</b-button>
                  </div>
                </b-field>
              </div>
            </div>
            <b-field class="control action" grouped>
              <a class="tag is-dark"><upload-icon class="icon is-small"></upload-icon><download-icon class="icon is-small"></download-icon></a>
              <span class="tag is-info">{{ speed }}/s</span>
            </b-field>
          </div>
          <b-table
            class="content"
            id="shares"
            :data.sync="shares"
            :checked-rows.sync="tableCheckedRows"
            checkable
            checkbox-position="left">
            <template slot-scope="props">
              <b-table-column field="name" label="Name" width="40vw" v-bind:class="{ 'is-warning' : props.row.paused }">
                <span style="word-break: break-word;max-width: 60vw;">{{ props.row.name }}</span>
              </b-table-column>
              <b-table-column field="size" label="Size" width="10vw" v-bind:class="{ 'is-warning' : props.row.paused }">
                {{ props.row.size }}
              </b-table-column>
              <b-table-column field="stats" label="Stats" width="50vw">
                <div v-show="!props.row.mine" class="control is-expanded downloadSection">
                  <a v-show="props.row.done" v-bind:href="props.row.downloadURL" v-bind:download="props.row.name">
                    <b-button type="is-success">Download</b-button>
                  </a>
                  <b-progress v-show="!props.row.done" type="is-success" size="is-medium" :value="props.row.progress" show-value>
                    <span>{{ props.row.progress }}%</span>
                    <span v-show="props.row.paused" class="has-text-black">&nbsp;(Paused)</span>
                  </b-progress>
                </div>
                <a class="tag is-info" v-show="props.row.mine"><upload-icon class="icon is-small" title="Ready for other devices to download"></upload-icon></a>
              </b-table-column>
            </template>
            <template slot="empty">
              <b-upload v-model="files" @input="onFileChange" :multiple="true">
                <p id="drop-area">Drop your files here or click to upload</p>
              </b-upload>
              <center>
                <p>Open <a href="https://WebDrop.Space">WebDrop</a> on your devices to join this room. Devices under the same WiFi will auto join the same room.</p>
                <p><span style="display: inline-block;vertical-align: top;">Use the Internet icon </span><span style="display: inline-block;vertical-align: bottom;"><earth-icon></earth-icon></span><span  style="display: inline-block;vertical-align: top;"> above to transfer files over internet</span></p>
              </center>
            </template>
          </b-table>
        </b-tab-item>
        <b-tab-item label="Messages" v-bind:class="{ noanim: !$store.state.settings.anim }">
          <template slot="header">
            <android-messages-icon class="icon is-small"></android-messages-icon>
            <span><span class="icon-text">Messages</span> <b-tag class="countTag" v-bind:class="{ 'is-danger': glowMsgsBtn }" rounded>{{ msgs.length }}</b-tag></span>
          </template>
          <b-field label="Message" class="is-floating-label">
            <b-input type="textarea" v-model="msg" placeholder="Type message here..."></b-input>
          </b-field>
          <b-field>
            <b-button type="button is-primary" @click="sendMsg">Send</b-button>
          </b-field>
          <div id="messages">
            <p v-show="msgs.length === 0">
              No messages
            </p>
            <div class="card" v-for="(msg, index) in msgs" :key="index">
              <header class="card-header">
                <p class="card-header-title">
                  <b-tag class="has-text-white" v-bind:style="{ 'background-color': msg.color }">{{ msg.time }}</b-tag>
                  <b-tag>{{ msg.name }}</b-tag>
                </p>
                <a class="card-header-icon" title="Copy message" @click="copyMsg" v-clipboard="msg.msg">
                  Copy
                </a>
              </header>
              <div class="card-content">
                <div class="content" v-html="msg.msg" v-linkified></div>
              </div>
            </div>
          </div>
        </b-tab-item>
        <b-tab-item label="Devices" v-bind:class="{ noanim: !$store.state.settings.anim }">
          <template slot="header">
            <devices-icon class="icon is-small"></devices-icon>
            <span><span class="icon-text">Devices</span> <b-tag class="countTag" v-bind:class="{ 'is-danger': glowUsersBtn }" rounded>{{ usersCount }}</b-tag></span>
          </template>
          <div class="content" style="position: relative;border-bottom: 2px dashed #dbdbdb;">
            <p>
              <router-link to="/grid">
                <b-button type="is-primary" style="float: right;">Show Grid</b-button>
              </router-link>
              <b-taglist attached>
                <router-link to="/settings">
                  <b-tag type="is-success" size="is-medium" v-bind:style="{ 'background-color': $store.state.settings.color }" class="has-text-white" style="text-overflow: ellipsis;max-width: 50vw;">
                    {{ $store.state.settings.name }}
                  </b-tag>
                  <b-tag type="is-warning" size="is-medium">Me</b-tag>
                </router-link>
              </b-taglist>
            </p>
            <span style="position: absolute;bottom: -11px">Devices</span>
            <!-- empty <p> necessary -->
            <p></p>
          </div>
          <p v-show="usersCount === 0">
            <center>Open WebDrop on your devices and make sure the devices are connected to the same WiFi.</center>
          </p>
          <b-field v-for="(user, userID) in users" :key="userID" grouped group-multiline>
            <b-taglist attached class="control noselect">
              <b-tag size="is-medium" v-bind:style="{ 'background-color': user.color }" class="has-text-white">{{ user.name }}</b-tag>
              <b-tag size="is-medium" type="is-warning">
                <a @click="ping(user)">Ping!</a>
              </b-tag>
            </b-taglist>
          </b-field>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import AndroidMessagesIcon from 'vue-material-design-icons/AndroidMessages.vue'
import DevicesIcon from 'vue-material-design-icons/Devices.vue'
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import EarthIcon from 'vue-material-design-icons/Earth.vue'
import FileMultipleIcon from 'vue-material-design-icons/FileMultiple.vue'
import FileUploadIcon from 'vue-material-design-icons/FileUpload.vue'
import UploadIcon from 'vue-material-design-icons/Upload.vue'

import * as sha1 from 'simple-sha1'

const shares = {}

let speedCheck = null
let bytesTransferred = 0 // this gets filled and reset every second as speedCheck porgresses

function formatBytes (bytes, decimals = 2) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export default {
  name: 'Send',

  components: {
    AndroidMessagesIcon,
    DevicesIcon,
    DownloadIcon,
    EarthIcon,
    FileMultipleIcon,
    FileUploadIcon,
    UploadIcon
  },

  data () {
    return {
      activeTab: Number(this.$store.state.settings.defaultTab),
      autoStart: this.$store.state.settings.autoStart,

      glowFilesBtn: false,
      glowMsgsBtn: false,
      glowUsersBtn: false,

      files: [],
      msg: '', // input field
      shares: [], // shares

      speed: '0B',

      tableCheckedRows: []
    }
  },

  watch: {
    autoStart (value) {
      this.$store.commit('setting', {
        name: 'autoStart',
        value
      })
    }
  },

  computed: {
    users () {
      return this.$store.state.users
    },

    usersCount () {
      return Object.keys(this.users).length
    },

    msgs () {
      // return [
      //   {
      //     name: 'Linux Firefox',
      //     msg: 'something something'
      //   }
      // ]
      return this.$store.state.msgs.slice().reverse()
    }
  },

  methods: {
    onFileChange (files) {
      for (const key in files) {
        this.makeShare(files[key])
      }
      this.files = []
    },

    addShareToList (share, mine = false) {
      const shareInfo = {
        shareID: share.shareID,
        name: share.name,
        size: formatBytes(share.length),
        paused: share.paused,
        done: false,
        mine,
        progress: 0
      }

      this.$set(this.shares, this.shares.length, shareInfo)
    },

    makeShare (file) {
      const shareID = sha1.sync(file.name + file.size)

      const share = {
        shareID: shareID,
        file,
        name: file.name,
        length: file.size,
        paused: false
      }

      this.$store.commit('addShare', share)

      // this share was added by user
      this.addShareToList(share, true)
    },

    // add new share obtained from a peer
    addNewShare (shareInfo) {
      const shareID = shareInfo.shareID

      if (shares[shareID]) {
        // share with same hash exist
        shares[shareID].addPeer(shareInfo.peer)
      } else {
        shareInfo.paused = !this.autoStart

        // add new item
        this.addShareToList(shareInfo, false)

        if (this.autoStart) {
          this.downloadShare(shareInfo)
        }
      }

      // Notify new files if user is not currently seeing Files tab
      if (!this.incomingNotify && (this.$route.name !== 'Shares' || (this.$route.name === 'Shares' && this.activeTab !== 0))) {
        // only allow one notify
        this.incomingNotify = this.$buefy.snackbar.open({
          message: 'New Incoming File!',
          type: 'is-warning',
          position: 'is-bottom',
          queue: true,
          actionText: 'See',
          onAction: () => {
            this.activeTab = 0

            if (this.$route.name !== 'Shares') {
              this.$router.push('/')
            }
            this.incomingNotify = null
          }
        })
        setTimeout(() => {
          this.incomingNotify = null
        }, 3000)
      }
    },

    // Start downloading
    downloadShare (shareInfo) {
      const shareID = shareInfo.shareID
      const peer = shareInfo.peer

      if (shares[shareID]) return

      this.$pf.receive(peer).then(transfer => {
        const share = {
          file: null,
          transfer
        }

        const index = this.getIndexOfShare(shareID)

        let prevBytes = 0
        let prevProgress = 0

        console.log(transfer)
        transfer.on('progress', receivedBytes => {
          bytesTransferred += receivedBytes - prevBytes
          prevBytes = receivedBytes

          const progress = parseInt((100 * (receivedBytes / shareInfo.length)).toFixed(1))

          if (prevProgress !== progress) {
            this.$set(this.shares[index], 'progress', progress)
            prevProgress = progress
          }
        })

        transfer.on('done', file => {
          const url = URL.createObjectURL(file)

          this.$set(this.shares[index], 'done', true)
          this.$set(this.shares[index], 'downloadURL', url)

          delete shares[shareID]

          // Are there other transfers happening ?
          if (Object.keys(shares).length === 0) {
            this.stopSpeedUpdate()
          }
        })

        transfer.start()
        this.startSpeedUpdate()

        shares[shareID] = share
        this.$set(this.shares[index], 'paused', false)
      })

      this.$store.state.p2pt.send(peer, {
        type: 'startSending',
        shareID
      })
    },

    resumeShare () {
      for (const share of this.tableCheckedRows) {
        this.$set(this.shares[this.getIndexOfShare(share.shareID)], 'paused', false)

        if (shares[share.shareID]) {
          shares[share.shareID].resume()
        } else {
          this.downloadShare(share.shareID)
        }
      }
    },

    removeShare () {
      const rows = this.tableCheckedRows

      for (const key in rows) {
        const shareID = rows[key].shareID
        const share = shares[shareID]

        this.$delete(this.shares, this.getIndexOfShare(shareID))

        if (share) share.destroy()
      }
      this.tableCheckedRows = []
    },

    getIndexOfShare (shareID) {
      for (const index in this.shares) {
        if (this.shares[index].shareID === shareID) {
          return index
        }
      }
      return null
    },

    ping (user) {
      const users = [user]
      this.$root.$emit('ping', users)
    },

    copyMsg () {
      this.$buefy.toast.open({
        duration: 2000,
        message: 'Message Copied !',
        position: 'is-top',
        type: 'is-primary'
      })
    },

    sendMsg () {
      const data = {
        type: 'msg',
        msg: this.msg,
        time: new Date().toLocaleTimeString()
      }

      this.$store.commit('addMessage', {
        ...data,
        ...{
          name: this.$store.state.settings.name,
          color: this.$store.state.settings.color
        }
      })

      for (const key in this.$store.state.users) {
        const user = this.$store.state.users[key]
        this.$store.state.p2pt.send(user.conn, data)
      }

      this.$buefy.toast.open({
        duration: 2000,
        message: 'Sent !',
        position: 'is-top',
        type: 'is-primary'
      })
      this.msg = ''
    },

    startSpeedUpdate () {
      if (!speedCheck) {
        const speed = () => {
          this.speed = formatBytes(bytesTransferred)
          bytesTransferred = 0
        }

        setTimeout(speed, 1000)
        speedCheck = setInterval(speed, 1000)
      }
    },

    stopSpeedUpdate () {
      clearInterval(speedCheck)
    }
  },

  mounted () {
    this.$store.subscribe((mutation) => {
      // newShare is share received from peers
      if (mutation.type === 'newShare') {
        this.addNewShare(mutation.payload)

        this.glowFilesBtn = true
        setTimeout(() => {
          this.glowFilesBtn = false
        }, 500)
      } else if (mutation.type === 'addShare') {
        // addShare is a new file added by user

        const p2pt = this.$store.state.p2pt
        const data = {
          ...mutation.payload,
          ...{ type: 'newShare' }
        }

        delete data.file

        // let peers know of this share
        for (const key in this.$store.state.users) {
          const user = this.$store.state.users[key]
          p2pt.send(user.conn, data)
        }
      } else if (mutation.type === 'addUser') {
        this.glowUsersBtn = true
        setTimeout(() => {
          this.glowUsersBtn = false
        }, 500)
      } else if (mutation.type === 'addMessage') {
        this.glowMsgsBtn = true
        setTimeout(() => {
          this.glowMsgsBtn = false
        }, 500)
      }
    })

    // handle file drop on page
    const target = document.documentElement
    const body = document.body
    let timeout, showDrag

    target.addEventListener('dragover', (e) => {
      e.preventDefault()
      body.classList.add('dragging')
      showDrag = true
    })

    target.addEventListener('dragleave', () => {
      showDrag = false
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (!showDrag) {
          body.classList.remove('dragging')
        }
      }, 200)
    })

    target.addEventListener('drop', (e) => {
      e.stopPropagation()
      e.preventDefault()
      body.classList.remove('dragging')

      function getFilesDataTransferItems (dataTransferItems) {
        const files = []

        function traverseFileTreePromise (item, path = '') {
          return new Promise(resolve => {
            if (item.isFile) {
              item.file(file => {
                file.filepath = path + file.name // save full path
                files.push(file)
                resolve(file)
              })
            } else if (item.isDirectory) {
              const dirReader = item.createReader()
              dirReader.readEntries(entries => {
                const entriesPromises = []
                for (const entr of entries) { entriesPromises.push(traverseFileTreePromise(entr, path + item.name + '/')) }
                resolve(Promise.all(entriesPromises))
              })
            }
          })
        }

        return new Promise((resolve, reject) => {
          const entriesPromises = []
          for (const it of dataTransferItems) {
            entriesPromises.push(traverseFileTreePromise(it.webkitGetAsEntry ? it.webkitGetAsEntry() : it.getAsEntry()))
          }
          Promise.all(entriesPromises)
            .then(() => {
              resolve(files)
            }).catch(reject)
        })
      }

      getFilesDataTransferItems(e.dataTransfer.items).then(files => {
        if (files) {
          this.onFileChange(files)
        }
      }).catch(() => {
        const files = Array.from(e.dataTransfer.files) // Array of all files

        if (files) {
          this.onFileChange(files)
        }
      })
    })
  }
}
</script>

<style lang="sass">
.container
  padding: 20px 0

@media screen and (max-width: 960px)
  .container
    padding: 20px 2%

  .b-tabs .tab-content
    padding: 1rem 0 1rem 0

  .modal .card-content
    padding: 0 1rem

@media screen and (min-width: 900px)
  .container
    max-width: 900px

@media screen and (max-width: 768px)
  .downloadSection
    width: 60vw
    margin-top: 5px

  // Show check all row box on mobile
  // Merge this to buefy :https://github.com/buefy/buefy/issues/2479
  .b-table .table-wrapper.has-mobile-cards
    thead
      display: block
      th
        display: none

      .checkbox-cell
        display: block
        width: 100%
        text-align: right

@media screen and (max-width: 460px)
  .icon-text
    display: none

  .file-upload-icon
    margin: 0 !important

.countTag
  transition: 0.25s all

#shares
  // margin-top: 20px

  .upload
    display: block

.action
  display: inline-flex
  align-items: center

  .tags, .tags .tag
    margin-bottom: 0

#messages
  margin-bottom: 20px

#drop-area
  padding: 10% 30%
  border: 2px dashed #DDD
  border-radius: 20px

  &:hover
    border-color: #8c67ef

.noselect
  user-select: none

body.dragging:after
  display: flex
  content: "Drop the file(s) anywhere on this page"
  position: fixed
  left: 0
  width: 100%
  top: 0
  height: 100%
  justify-content: center
  align-items: center
  font-size: 1.5em
  background-color: rgba(255, 255, 0, .3)
  pointer-events: none
  transition: 0.5s all

// To make field label on-border of input
// obtained from node_modules/buefy/src/scss/components/_form.scss
.field.is-floating-label
  position: relative

  .label
    position: absolute
    left: 1em
    z-index: 5
    top: -0.775em
    padding-left: 0.125em
    padding-right: 0.125em
    font-size: calc(1rem * 3 / 4);
</style>
