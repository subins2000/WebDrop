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
                <a class="button is-primary" aria-label="Add File/Folder" title="Add File/Folder">
                  <file-upload-icon class="icon is-small"></file-upload-icon>
                  <span class="icon-text">Add File</span>
                </a>
              </b-upload>
            </div>
            <div class="control" id="shareButtons" v-show="tableCheckedRows.length > 0">
              <div class="control" v-if="tableCheckedRows.length === 1">
                <b-field grouped>
                  <div class="control" v-if="tableCheckedRows[0].paused">
                    <a class="button is-warning" @click="resumeShare" aria-label="Resume" title="Resume">
                      <play-icon class="icon is-small"></play-icon>
                    </a>
                  </div>
                  <div class="control" v-else>
                    <a class="button" @click="pauseShare" aria-label="Pause" title="Pause">
                      <pause-icon class="icon is-small"></pause-icon>
                    </a>
                  </div>
                  <div class="control">
                    <a class="button is-danger" @click="removeShare" aria-label="Delete" title="Delete">
                      <delete-icon class="icon is-small"></delete-icon>
                    </a>
                  </div>
                </b-field>
              </div>
              <div class="control" v-else>
                <b-field grouped>
                  <div class="control">
                    <a class="button is-warning" @click="resumeShare" aria-label="Resume" title="Resume">
                      <play-icon class="icon is-small"></play-icon>
                    </a>
                  </div>
                  <div class="control">
                    <a class="button" @click="pauseShare" aria-label="Pause" title="Pause">
                      <pause-icon class="icon is-small"></pause-icon>
                    </a>
                  </div>
                  <div class="control">
                    <a class="button is-danger" @click="removeShare" aria-label="Delete" title="Delete">
                      <delete-icon class="icon is-small"></delete-icon>
                    </a>
                  </div>
                </b-field>
              </div>
            </div>
            <b-field class="control action" grouped>
              <span class="tag is-dark"><speed-icon class="icon is-small"></speed-icon><span>{{ speed }}/s</span></span>
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
              <b-table-column field="name" label="Name" width="40vw" v-bind:class="{ 'is-warning' : props.row.paused }" sortable>
                <span style="word-break: break-word;max-width: 60vw;">{{ props.row.name }}</span>
              </b-table-column>
              <b-table-column field="size" label="Size" width="10vw" v-bind:class="{ 'is-warning' : props.row.paused }" sortable>
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
                <b-field grouped group-multiline v-if="props.row.mine">
                  <div class="control">
                    <span class="tags has-addons">
                      <span class="tag is-info"><upload-icon class="icon is-small" title="Ready for other devices to download"></upload-icon></span>
                    </span>
                  </div>
                  <div class="control" v-for="(progress, userID) in props.row.users" :key="userID">
                    <div class="tags has-addons" v-if="$store.state.users[userID]">
                      <span class="tag is-dark">{{ progress }}%</span>
                      <span class="tag" v-if="Object.keys(props.row.users).length > 1" v-bind:style="{ 'background-color': $store.state.users[userID].color }">{{ $store.state.users[userID].name }}</span>
                    </div>
                  </div>
                </b-field>
              </b-table-column>
            </template>
            <template slot="empty">
              <b-upload v-model="files" @input="onFileChange" :multiple="true">
                <p id="drop-area">Drop your files here or click to upload</p>
              </b-upload>
              <center>
                <p>Open <a href="https://WebDrop.Space">WebDrop.Space</a> on your devices to join this room. Devices under the same WiFi/network will auto join the same room.</p>
                <p>Do you want to transfer files over internet ?<br/><earth-icon></earth-icon><br/><router-link to="/room">Share Invite Link or Join Room</router-link></p>
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
            <div class="control is-clearfix">
              <textarea
                placeholder="Type message here..."
                class="textarea"
                v-model="msg"
                ref="msgInput"
                @keydown.enter.exact.prevent
                @keyup.enter.exact="sendMsg"></textarea>
            </div>
          </b-field>
          <b-field>
            <div class="control">
              <b-button type="button is-primary" @click="sendMsg">Send</b-button>
              <div class="is-pulled-right">
                <b-tooltip label="Auto copy to clipboard" position="is-left" type="is-dark">
                  <router-link to="/settings" tag="div" class="button is-dark">
                    <robot-icon class="icon is-small"></robot-icon>
                  </router-link>
                </b-tooltip>&nbsp;
                <b-tooltip label="Clear all messages" position="is-left" type="is-dark">
                  <a class="button is-danger" aria-label="Clear all messages" title="Clear all messages" @click="clearAllMsgs">
                    <notification-clear-all-icon class="icon is-small"></notification-clear-all-icon>
                  </a>
                </b-tooltip>
              </div>
            </div>
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
                <div class="content" v-html="msg.msg" v-linkified style="white-space: pre-line;"></div>
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
            <center class="content">
              <p>Open <a href="https://WebDrop.Space">WebDrop.Space</a> on your devices and make sure they are connected to the same WiFi/network.</p>
              <p>Do you want to transfer files over internet ?<br/><earth-icon></earth-icon><br/><router-link to="/room">Share Invite Link or Join Room</router-link></p>
            </center>
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
import ArrowUpIcon from 'vue-material-design-icons/ArrowUp.vue'
import DeleteIcon from 'vue-material-design-icons/Delete.vue'
import DevicesIcon from 'vue-material-design-icons/Devices.vue'
import EarthIcon from 'vue-material-design-icons/Earth.vue'
import FileMultipleIcon from 'vue-material-design-icons/FileMultiple.vue'
import FileUploadIcon from 'vue-material-design-icons/FileUpload.vue'
import NotificationClearAllIcon from 'vue-material-design-icons/NotificationClearAll.vue'
import PauseIcon from 'vue-material-design-icons/Pause.vue'
import PlayIcon from 'vue-material-design-icons/Play.vue'
import RobotIcon from 'vue-material-design-icons/Robot.vue'
import SpeedIcon from 'vue-material-design-icons/Speedometer.vue'
import UploadIcon from 'vue-material-design-icons/Upload.vue'

import NoSleep from 'nosleep.js'
import * as sha1 from 'simple-sha1'
import * as streamSaver from 'streamsaver'
import * as ponyfill from 'web-streams-polyfill/ponyfill'

const noSleep = new NoSleep()

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
    DeleteIcon,
    DevicesIcon,
    EarthIcon,
    FileMultipleIcon,
    FileUploadIcon,
    NotificationClearAllIcon,
    PauseIcon,
    PlayIcon,
    RobotIcon,
    SpeedIcon,
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
    },

    activeTab (value) {
      if (value === 1) {
        this.focusMsgInput()
      }
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
    },

    activeTransfers () {
      let transfers = 0
      Object.values(this.$store.state.shares).forEach(share => {
        transfers += share.transfers.length
      })
      return transfers
    }
  },

  methods: {
    onFileChange (files) {
      for (const key in files) {
        this.makeShare(files[key])
      }
      this.files = []
      noSleep.enable()
    },

    focusMsgInput () {
      const f = () => {
        this.$refs.msgInput.focus()
      }
      if (this.$store.state.settings.anim) {
        setTimeout(f, 1000)
      } else {
        this.$nextTick(f)
      }
    },

    addShareToList (share, mine = false) {
      const shareInfo = {
        shareID: share.shareID,
        name: share.name,
        size: formatBytes(share.size),
        paused: share.paused,
        done: false,
        mine,
        progress: 0
      }

      if (mine) {
        // For storing upload progress
        shareInfo.users = {}
      }

      this.$set(this.shares, this.shares.length, shareInfo)
    },

    makeShare (file) {
      const shareID = sha1.sync(file.name + file.size)

      if (this.$store.state.shares[shareID]) return

      const share = {
        shareID: shareID,
        file,
        name: file.name,
        size: file.size,
        paused: false
      }

      this.$store.commit('addShare', share)

      // this share was added by user
      this.addShareToList(share, true)
    },

    // add new share obtained from a peer
    addNewShare (shareInfo) {
      const shareID = shareInfo.shareID

      // Will return number if the share is already in list
      const index = this.getIndexOfShare(shareID)

      if (index === null) {
        shareInfo.paused = !this.autoStart

        // add new item
        this.addShareToList(shareInfo, false)
      } else if (this.shares[index].done) {
        // File already completed
        return
      }

      if (this.autoStart) {
        this.downloadShare(shareInfo)
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

      this.$pf.receive(peer, shareID).then(transfer => {
        const share = {
          file: null,
          transfer
        }

        const index = this.getIndexOfShare(shareID)

        let prevBytes = 0
        let prevProgress = 0

        transfer.on('progress', (progress, receivedBytes) => {
          bytesTransferred += receivedBytes - prevBytes
          prevBytes = receivedBytes

          // parseInt will make it single digit
          progress = parseInt(progress)

          if (prevProgress !== progress) {
            this.$set(this.shares[index], 'progress', progress)
            prevProgress = progress
          }
        })

        transfer.on('done', file => {
          this.$set(this.shares[index], 'progress', 100)

          const url = URL.createObjectURL(file)

          this.$set(this.shares[index], 'done', true)
          this.$set(this.shares[index], 'downloadURL', url)

          this.$store.commit('removeTransfer', {
            shareID,
            userID: transfer.peer._id
          })
        })

        this.$store.commit('setTransfer', {
          shareID,
          transfer
        })

        this.$set(this.shares[index], 'paused', false)

        if (this.$store.state.settings.autoBrowserDownload) {
          const fileStream = transfer.createReadStream()

          // Allows downloading file to browser as file progresses
          streamSaver.WritableStream = ponyfill.WritableStream
          const downloadStream = streamSaver.createWriteStream(shareInfo.name, {
            size: shareInfo.size
          })
          const writer = downloadStream.getWriter()

          fileStream
            .on('data', chunk => writer.write(chunk))
            .on('end', () => writer.close())
        }
      })

      this.$store.state.p2pt.send(peer, {
        type: 'startSending',
        shareID
      })
    },

    pauseShare () {
      for (const shareInfo of this.tableCheckedRows) {
        this.$set(this.shares[this.getIndexOfShare(shareInfo.shareID)], 'paused', true)
        this.$store.commit('pauseShare', shareInfo.shareID)
      }
    },

    resumeShare () {
      for (const shareInfo of this.tableCheckedRows) {
        this.$set(this.shares[this.getIndexOfShare(shareInfo.shareID)], 'paused', false)

        const share = this.$store.state.shares[shareInfo.shareID]
        if (share && share.transfers.length > 0) {
          share.transfers.forEach(t => {
            t.resume()
          })
        } else if (!shareInfo.mine) {
          // This will be only called in receiver
          this.downloadShare(shareInfo.shareID)
        }
      }
    },

    removeShare () {
      const rows = this.tableCheckedRows

      for (const key in rows) {
        const shareID = rows[key].shareID

        this.$delete(this.shares, this.getIndexOfShare(shareID))
        this.$store.commit('removeShare', shareID)
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

    // Delete all msgs
    clearAllMsgs () {
      this.$store.commit('clearMessages')
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

      this.msg = ''
    },

    startSpeedUpdate () {
      if (!speedCheck) {
        const speed = () => {
          this.speed = formatBytes(bytesTransferred)
          bytesTransferred = 0
        }

        // Keep mobile screen on
        document.addEventListener('click', function enableNoSleep () {
          document.removeEventListener('click', enableNoSleep, false)
          noSleep.enable()
        }, false)

        setTimeout(speed, 1000)
        speedCheck = setInterval(speed, 1000)
      }
    },

    stopSpeedUpdate () {
      if (this.activeTransfers === 0) {
        clearInterval(speedCheck)
        speedCheck = null

        bytesTransferred = 0
        this.speed = '0B'

        noSleep.disable()
      }
    }
  },

  mounted () {
    this.$store.subscribe((mutation) => {
      const type = mutation.type
      const payload = mutation.payload

      // newShare is share received from peers
      if (type === 'newShare') {
        this.addNewShare(payload)

        this.glowFilesBtn = true
        setTimeout(() => {
          this.glowFilesBtn = false
        }, 500)
      } else if (type === 'addShare') {
        // addShare is a new file added by user

        const p2pt = this.$store.state.p2pt
        const data = {
          ...payload,
          ...{ type: 'newShare' }
        }

        delete data.file

        // let peers know of this share
        for (const key in this.$store.state.users) {
          const user = this.$store.state.users[key]
          p2pt.send(user.conn, data)
        }
      } else if (type === 'removeUser') {
        // Remove user from upload progress
        // This only applies to the uploader
        Object.entries(this.shares).forEach((share, shareID) => {
          if (this.shares[shareID].mine) {
            this.$delete(this.shares[shareID].users, payload)
          }
        })
      } else if (type === 'addUser') {
        this.glowUsersBtn = true
        setTimeout(() => {
          this.glowUsersBtn = false
        }, 500)
      } else if (type === 'addMessage') {
        this.glowMsgsBtn = true
        setTimeout(() => {
          this.glowMsgsBtn = false
        }, 500)
      } else if (type === 'setTransfer') {
        // This will be called when transfer starts
        this.startSpeedUpdate()
      } else if (type === 'removeTransfer') {
        // This will be called when transfer completes
        setTimeout(() => {
          // Timeout to let store clear the transfer
          this.stopSpeedUpdate()
        }, 1000)
      }
    })

    // ----
    // We use Vuex Actions as cross component event bus
    // ----
    this.$store.subscribeAction(action => {
      const type = action.type
      const payload = action.payload

      if (type === 'uploadProgress') {
        bytesTransferred += payload.bytes

        const index = this.getIndexOfShare(payload.shareID)

        this.$set(
          this.shares[index].users,
          payload.userID,
          payload.progress
        )
      } else if (type === 'invalidRoomCode') {
        this.$buefy.toast.open({
          duration: 2000,
          message: 'Invalid Room Code',
          position: 'is-top',
          type: 'is-danger',
          queue: false
        })
      }
    })

    // focus msg input
    if (this.activeTab === 1) this.focusMsgInput()

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

// Disabling overflow because .tags in last row causes an unneeded vertical scrollbar
.table-wrapper
  overflow-y: hidden

// No sorting in phone cause it needs select component to look good
.table-mobile-sort
  display: none

@media screen and (max-width: 960px)
  .container
    padding: 20px 2%

  .b-tabs .tab-content
    padding: 1rem 0 1rem 0

@media screen and (min-width: 900px)
  .container
    max-width: 900px

@media screen and (max-width: 768px)
  .downloadSection
    width: 60vw
    margin-top: 5px

  // Show check all row box on mobile
  // Merge this to buefy: https://github.com/buefy/buefy/issues/2479
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
    font-size: calc(1rem * 3 / 4)
    background-color: rgb(255, 255, 255)
</style>
