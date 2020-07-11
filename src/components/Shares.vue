<template>
  <div>
    <div class="container">
      <b-tabs v-model="activeTab" type="is-boxed" expanded>
        <b-tab-item label="Files">
          <template slot="header">
            <file-multiple-icon class="icon is-small"></file-multiple-icon>
            <span><span class="icon-text">Files</span> <b-tag class="countTag" v-bind:class="{ 'is-danger': glowFilesBtn }" rounded>{{ torrents.length }}</b-tag> </span>
          </template>
          <!-- using class for purgecss to detect -->
          <div class="field content is-grouped is-grouped-multiline">
            <div class="control">
              <b-upload v-model="files" multiple allowdirs @input="onFileChange">
                <a class="button is-info" aria-label="Add File/Folder" title="Add File/Folder">
                  <file-upload-icon class="icon is-small"></file-upload-icon>
                  <span class="icon-text">Add File</span>
                </a>
              </b-upload>
            </div>
            <div class="control action" v-show="tableCheckedRows.length === 0">
              <router-link to="/settings" class="tag is-primary is-medium" title="Settings">
                <cog-icon class="icon is-medium"></cog-icon>
              </router-link>
            </div>
            <div class="control" id="torrentButtons" v-show="tableCheckedRows.length > 0">
              <div class="control" v-if="tableCheckedRows.length === 1">
                <b-field grouped>
                  <div class="control" v-if="!tableCheckedRows[0].mine && tableCheckedRows[0].paused">
                    <b-button @click="resumeTorrent">Start</b-button>
                  </div>
                  <div class="control">
                    <b-button type="is-danger" @click="removeTorrent">Remove</b-button>
                  </div>
                </b-field>
              </div>
              <div class="control" v-else>
                <b-field grouped>
                  <div class="control">
                    <b-button @click="resumeTorrent">Start</b-button>
                  </div>
                  <div class="control">
                    <b-button type="is-danger" @click="removeTorrent">Remove</b-button>
                  </div>
                </b-field>
              </div>
            </div>
            <b-field class="control action" grouped>
              <div class="tags has-addons">
                <a class="tag is-dark"><upload-icon class="icon is-small"></upload-icon></a>
                <span class="tag is-info">{{ uploadSpeed }}/s</span>
              </div>
              <div class="tags has-addons">
                <a class="tag is-dark"><download-icon class="icon is-small"></download-icon></a>
                <span class="tag is-success">{{ downloadSpeed }}/s</span>
              </div>
            </b-field>
          </div>
          <b-table
            class="content"
            id="torrents"
            :data.sync="torrents"
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
              <b-upload v-model="files" @input="onFileChange" multiple>
                <p id="drop-area">Drop your files here or click to upload</p>
              </b-upload>
            </template>
          </b-table>
        </b-tab-item>
        <b-tab-item label="Messages">
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
                <div class="content">{{ msg.msg }}</div>
              </div>
            </div>
          </div>
        </b-tab-item>
        <b-tab-item label="Devices">
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
                <b-tag type="is-success" size="is-medium" v-bind:style="{ 'background-color': $store.state.settings.color }" class="has-text-white" style="text-overflow: ellipsis;max-width: 50vw;">
                  {{ $store.state.settings.color }}
                </b-tag>
                <b-tag type="is-warning" size="is-medium">Me</b-tag>
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
import CogIcon from 'vue-material-design-icons/Cog.vue'
import DevicesIcon from 'vue-material-design-icons/Devices.vue'
import DownloadIcon from 'vue-material-design-icons/Download.vue'
import FileMultipleIcon from 'vue-material-design-icons/FileMultiple.vue'
import FileUploadIcon from 'vue-material-design-icons/FileUpload.vue'
import UploadIcon from 'vue-material-design-icons/Upload.vue'

const torrentsWT = {} // WebTorrent objects
let speedCheck = null

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
    CogIcon,
    DevicesIcon,
    DownloadIcon,
    FileMultipleIcon,
    FileUploadIcon,
    UploadIcon
  },

  data () {
    return {
      activeTab: 0,
      autoStart: this.$store.state.settings.autoStart,

      glowFilesBtn: false,
      glowMsgsBtn: false,
      glowUsersBtn: false,

      files: [],
      msg: '', // input field
      torrents: [], // torrents

      uploadSpeed: '0B',
      downloadSpeed: '0B',

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
        this.makeTorrent(files[key])
      }
      this.files = []
    },

    addTorrentToList (torrent, mine = false) {
      const torrentInfo = {
        infoHash: torrent.infoHash,
        name: torrent.name,
        size: formatBytes(torrent.length),
        paused: torrent.paused,
        done: false,
        mine,
        progress: 0,
        uploadSpeed: 0,
        downloadSpeed: 0
      }

      this.$set(this.torrents, this.torrents.length, torrentInfo)
    },

    makeTorrent (file) {
      const snack = this.$buefy.snackbar.open({
        message: 'Preparing file. This might take a while depending on file size',
        type: 'is-warning',
        queue: true,
        indefinite: true,
        actionText: 'Ok'
      })

      this.$wt.seed(file, {
        announceList: [this.$ANNOUNCE_URLS],
        name: file.name
      }, (torrent) => {
        snack.close()

        this.$store.commit('addTorrent', {
          i: torrent.infoHash,
          n: torrent.name,
          l: torrent.length
        })

        // this torrent was added by user
        this.addTorrentToList(torrent, true)

        this.onTorrent(torrent)
      })
    },

    // torrent is WebTorrent's Torrent object
    onTorrent (torrent) {
      const index = this.getIndexOfTorrent(torrent.infoHash)

      torrent.on('done', () => {
        // there will be only one file
        const file = torrent.files[0]
        file.getBlobURL((err, url) => {
          if (err) throw err

          this.$set(this.torrents[index], 'done', true)
          this.$set(this.torrents[index], 'downloadURL', url)
        })
      })

      if (!torrentsWT[torrent.infoHash]) {
        torrentsWT[torrent.infoHash] = torrent
      }

      this.$set(this.torrents[index], 'paused', false)

      this.startSpeedCheck()
    },

    // add new torrent obtained from a peer
    addNewTorrent (torrentInfo) {
      const infoHash = torrentInfo.i

      if (torrentsWT[infoHash]) {
        // torrent with same hash exist
        torrentsWT[infoHash].addPeer(torrentInfo.peer)
      } else {
        // add new item
        this.addTorrentToList({
          infoHash: torrentInfo.i,
          name: torrentInfo.n,
          length: torrentInfo.l,
          paused: !this.autoStart
        }, false)

        if (this.autoStart) {
          this.startTorrent(torrentInfo.i)
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

    startTorrent (infoHash) {
      if (torrentsWT[infoHash]) return

      this.$wt.add(infoHash, {
        announce: this.$ANNOUNCE_URLS
      }, (torrent) => {
        this.onTorrent(torrent)
      })
      return null
    },

    resumeTorrent () {
      for (const torrent of this.tableCheckedRows) {
        this.$set(this.torrents[this.getIndexOfTorrent(torrent.infoHash)], 'paused', false)

        if (torrentsWT[torrent.infoHash]) {
          torrentsWT[torrent.infoHash].resume()
        } else {
          this.startTorrent(torrent.infoHash)
        }
      }
    },

    removeTorrent () {
      const rows = this.tableCheckedRows

      for (const key in rows) {
        const infoHash = rows[key].infoHash
        const torrent = torrentsWT[infoHash]

        this.$delete(this.torrents, this.getIndexOfTorrent(infoHash))

        if (torrent) torrent.destroy()
      }
      this.tableCheckedRows = []
    },

    getIndexOfTorrent (infoHash) {
      for (const index in this.torrents) {
        if (this.torrents[index].infoHash === infoHash) {
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
        this.$store.state.p2pt.send(user.conn, JSON.stringify(data))
      }

      this.$buefy.toast.open({
        duration: 2000,
        message: 'Sent !',
        position: 'is-top',
        type: 'is-primary'
      })
      this.msg = ''
    },

    startSpeedCheck () {
      if (!speedCheck) {
        speedCheck = setInterval(() => {
          this.uploadSpeed = formatBytes(this.$wt.uploadSpeed)
          this.downloadSpeed = formatBytes(this.$wt.downloadSpeed)

          for (const index in this.torrents) {
            const torrent = this.torrents[index]

            if (torrent.done || !torrentsWT[torrent.infoHash]) continue

            // Vue will make rendering delay and slows down file transfer if progress value is directly given
            const progress = parseInt((100 * torrentsWT[torrent.infoHash].progress).toFixed(1))

            if (torrent.progress !== progress) {
              this.$set(this.torrents[index], 'progress', progress)
            }
          }
        }, 1000)
      }
    }
  },

  mounted () {
    this.$store.subscribe((mutation) => {
      // new torrent is torrent received from peers
      if (mutation.type === 'newTorrent') {
        this.addNewTorrent(mutation.payload)

        this.glowFilesBtn = true
        setTimeout(() => {
          this.glowFilesBtn = false
        }, 500)
      } else if (mutation.type === 'addTorrent') {
        const p2pt = this.$store.state.p2pt
        const data = {
          ...mutation.payload,
          ...{ type: 'newTorrent' }
        }

        // let peers know of this torrent
        for (const key in this.$store.state.users) {
          const user = this.$store.state.users[key]
          p2pt.send(user.conn, JSON.stringify(data))
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

#torrents
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
