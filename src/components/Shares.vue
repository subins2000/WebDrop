<template>
  <div>
    <div class="container">
      <b-tabs type="is-boxed" expanded>
        <b-tab-item label="Files" v-click-outside="onOutsideClick">
          <template slot="header">
            <span>Files <b-tag class="countTag" v-bind:class="{ 'is-danger': glowUsersBtn }" rounded>{{ torrents.length }}</b-tag> </span>
          </template>
          <b-field class="actions content" grouped>
            <b-upload v-model="files" multiple @input="onFileChange">
              <a class="button is-info">
                <span>Add File</span>
              </a>
            </b-upload>
            <b-tooltip label="Start downloading files on receive" position="is-bottom">
              <b-switch v-model="autoStart" type="is-danger">
                Auto Start
              </b-switch>
            </b-tooltip>
          </b-field>
          <div v-if="selectedRows.length > 0">
            <span v-if="selectedRows.length === 1">
              <b-field grouped>
                <div class="control" v-if="!selectedRows[0].mine && selectedRows[0].paused">
                  <b-button @click="resumeTorrent">Start</b-button>
                </div>
                <div class="control">
                  <b-button type="is-danger" @click="removeTorrent">Remove</b-button>
                </div>
              </b-field>
            </span>
            <span v-else>
              <b-field grouped group-multiline>
                <div class="control">
                  <b-button @click="resumeTorrent">Start</b-button>
                </div>
                <div class="control">
                  <b-button type="is-danger" @click="removeTorrent">Remove</b-button>
                </div>
              </b-field>
            </span>
          </div>
          <div v-else>
            <b-field grouped group-multiline>
              <div class="control">
                <b-button disabled>Start</b-button>
              </div>
              <div class="control">
                <b-button disabled>Remove</b-button>
              </div>
            </b-field>
          </div>
          <b-table
            class="content"
            id="torrents"
            :data.sync="torrents"
            :checked-rows.sync="tableCheckedRows"
            checkable
            checkbox-position="left"
            focusable
            :selected.sync="tableSelectedRow">
            <template slot-scope="props">
              <b-table-column field="name" label="Name" width="40vw" v-bind:class="{ 'is-warning' : props.row.paused }">
                <span style="word-break: break-word;max-width: 60vw;">{{ props.row.name }}</span>
              </b-table-column>
              <b-table-column field="size" label="Size" width="10vw" v-bind:class="{ 'is-warning' : props.row.paused }">
                {{ props.row.length | formatSize }}
              </b-table-column>
              <b-table-column field="stats" label="Stats" width="50vw">
                <div class="columns is-gapless is-vcentered">
                  <div v-show="!props.row.paused" class="column is-5">
                    <b-field grouped group-multiline>
                      <b-taglist class="control" attached>
                        <b-tag type="is-dark">🔼</b-tag>
                        <b-tag type="is-info">{{ props.row.wdUpSpeed | formatSize }}/s</b-tag>
                      </b-taglist>
                      <b-taglist class="control" attached>
                        <b-tag type="is-dark">🔽</b-tag>
                        <b-tag type="is-success">{{ props.row.wdDownSpeed | formatSize }}/s</b-tag>
                      </b-taglist>
                    </b-field>
                  </div>
                  <div v-if="!props.row.mine" class="column">
                    <a v-show="props.row.done" v-bind:href="props.row.downloadURL" v-bind:download="props.row.name">
                      <b-button type="is-success">Download</b-button>
                    </a>
                    <b-progress v-show="!props.row.done" type="is-success" :value="props.row.wdProgress" size="is-medium" show-value format="percent"></b-progress>
                  </div>
                </div>
              </b-table-column>
            </template>
            <template slot="empty">
              <b-upload v-model="files" @input="onFileChange"
                multiple
                drag-drop>
                <p id="drop-area">Drop your files here or click to upload</p>
              </b-upload>
            </template>
          </b-table>
        </b-tab-item>
        <b-tab-item label="Messages">

        </b-tab-item>
        <b-tab-item label="Devices">
          <template slot="header">
            <span>Devices <b-tag class="countTag" v-bind:class="{ 'is-danger': glowUsersBtn }" rounded>{{ usersCount }}</b-tag> </span>
          </template>
          <center class="content">
            <router-link to="/grid">
              <b-button type="is-success" size="is-medium">Show Grid</b-button>
            </router-link>
          </center>
          <b-field v-for="(user, userID) in $store.state.users" :key="userID" grouped group-multiline>
            <b-taglist attached class="control">
              <b-tag size="is-medium" type="is-info">{{ user.name }}</b-tag>
              <b-tag size="is-medium" type="is-warning">
                <b-button type="is-warning" size="is-small">Ping!</b-button>
              </b-tag>
            </b-taglist>
          </b-field>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import * as throttle from 'throttleit'

export default {
  name: 'Send',

  data () {
    return {
      autoStart: true,

      glowUsersBtn: false,

      files: [],
      torrents: [],

      tableCheckedRows: [],
      tableSelectedRow: {}
    }
  },

  computed: {
    usersCount () {
      return Object.keys(this.$store.state.users).length
    },

    selectedRows () {
      if (this.tableCheckedRows.length === 0) {
        return Object.keys(this.tableSelectedRow).length === 0 ? [] : [this.tableSelectedRow]
      } else {
        return this.tableCheckedRows
      }
    }
  },

  methods: {
    onFileChange (files) {
      for (const key in files) {
        this.makeTorrent(files[key])
      }
      this.files = []
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
        torrent.mine = true

        this.onTorrent(torrent)
      })
    },

    onTorrent (torrent, index = this.torrents.length) {
      torrent.on('done', () => {
        // there will be only one file
        const file = torrent.files[0]
        file.getBlobURL((err, url) => {
          if (err) throw err
          this.$set(this.torrents[index], 'downloadURL', url)
        })
      })

      // custom properties added to Torrent object
      torrent.wdUpSpeed = 0
      torrent.wdDownSpeed = 0

      this.$set(this.torrents, index, torrent)

      const updateSpeed = () => {
        if (!this.torrents[index]) return

        // Vue will make rendering delay and slows down file transfer if progress value is directly given
        const progress = parseInt((100 * torrent.progress).toFixed(1))

        this.torrents[index].wdProgress = progress

        // bytes per second
        this.$set(this.torrents[index], 'wdUpSpeed', torrent.uploadSpeed)
        this.$set(this.torrents[index], 'wdDownSpeed', torrent.downloadSpeed)
      }
      torrent.on('download', throttle(updateSpeed, 500))
      torrent.on('upload', throttle(updateSpeed, 500))
      updateSpeed()
    },

    // add new torrent obtained from a peer
    addNewTorrent (torrentInfo) {
      let index = this.getIndexOfTorrent(torrentInfo.i)

      if (index) {
        // torrent with same hash exist
        this.torrents[index].addPeer(torrentInfo.peer)
      } else {
        // add new item
        index = this.torrents.length
        this.$set(this.torrents, index, {
          infoHash: torrentInfo.i,
          name: torrentInfo.n,
          length: torrentInfo.l,
          mine: false,
          wdUpSpeed: 0,
          wdDownSpeed: 0
        })

        if (this.autoStart) {
          this.startTorrent(index)
        }
      }
    },

    startTorrent (index) {
      const infoHash = this.torrents[index].infoHash

      this.$wt.add(infoHash, {
        announce: this.$ANNOUNCE_URLS
      }, (torrent) => {
        torrent.mine = false
        this.onTorrent(torrent, index)
      })
      return null
    },

    resumeTorrent () {
      for (const torrent of this.selectedRows) {
        if (!torrent.resume) {
          // torrent is not a WebTorrent object
          // make it one
          this.startTorrent(this.getIndexOfTorrent(torrent.infoHash))
        } else {
          torrent.resume()
        }
      }
    },

    removeTorrent () {
      const rows = this.selectedRows
      for (const key in rows) {
        const torrent = rows[key]
        if (!torrent.destroy) continue

        this.$delete(this.torrents, this.getIndexOfTorrent(torrent.infoHash))
        torrent.destroy()

        this.tableSelectedRow = {}
        if (this.tableCheckedRows[key]) {
          delete this.tableCheckedRows[key]
        }
      }
    },

    getIndexOfTorrent (infoHash) {
      for (const index in this.torrents) {
        if (this.torrents[index].infoHash === infoHash) {
          return index
        }
      }
      return null
    },

    onOutsideClick () {
      this.tableSelectedRow = {}
    }
  },

  mounted () {
    this.$store.subscribe((mutation) => {
      // new torrent is torrent received from peers
      if (mutation.type === 'newTorrent') {
        this.addNewTorrent(mutation.payload)
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
      e.preventDefault()
      e.stopPropagation()
      body.classList.remove('dragging')

      const files = Array.from(e.dataTransfer.files) // Array of all files

      if (files) {
        this.onFileChange(files)
      }
    })
  }
}
</script>

<style lang="sass">
.countTag
  transition: 0.25s all

#torrents
  margin-top: 20px

  .upload
    display: block

  .field.is-grouped.is-grouped-multiline
    margin-bottom: 0

    .control, .tags:last-child
      margin-bottom: 0

#drop-area
  padding: 10% 30%

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
</style>
