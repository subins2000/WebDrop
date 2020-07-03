<template>
  <div>
    <b-navbar class="is-success" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <b-navbar-item tag="router-link" :to="{ path: '/grid' }">
          Grid
        </b-navbar-item>
        <div class="actions">
          <b-navbar-item tag="router-link" :to="{ path: '/about' }">
            Help
          </b-navbar-item>
        </div>
      </template>
    </b-navbar>
    <div class="container">
      <b-field class="actions content" grouped>
        <b-upload v-model="files" multiple @input="onFileChange">
          <a class="button is-success">
            <span>Add File</span>
          </a>
        </b-upload>
        <b-button class="is-text">
          {{ usersCount }} users
        </b-button>
        <b-tooltip label="Start downloading files on receive" position="is-bottom">
          <b-switch v-model="autoStart" type="is-danger">
            Auto Start
          </b-switch>
        </b-tooltip>
        <b-button class="is-text">
          {{ status }}
        </b-button>
      </b-field>
      <div v-if="tableCheckedRows.length > 0">
        <span v-if="tableCheckedRows.length === 1">
          <b-field grouped group-multiline>
            <div class="control" v-if="!tableCheckedRows[0].mine && tableCheckedRows[0].paused">
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
        :data="torrents"
        :checked-rows.sync="tableCheckedRows"
        checkable
        checkbox-position="left"
        is-fullwidth>
        <template slot-scope="props">
          <b-table-column field="name" label="Name" width="40vw" v-bind:class="{ 'is-warning' : props.row.paused }">
            <span>{{ props.row.name }}</span>
          </b-table-column>
          <b-table-column field="size" label="Size" width="10vw" v-bind:class="{ 'is-warning' : props.row.paused }">
            {{ props.row.length | formatSize }}
          </b-table-column>
          <b-table-column field="stats" label="Stats" width="50vw">
            <div class="columns is-gapless is-multiline is-vcentered">
              <div v-show="!props.row.paused" class="column is-5">
                <span v-if="props.row.wdUpSpeed">Upload: {{ props.row.wdUpSpeed | formatSize }}/s <br/></span>
                <span v-if="props.row.wdDownSpeed">Download: {{ props.row.wdDownSpeed | formatSize }}/s</span>
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
            <p class="drop-area">Drop your files here or click to upload</p>
          </b-upload>
        </template>
      </b-table>
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

      files: [],
      torrents: [],
      selectedUsers: this.$store.state.selectedUsers,
      status: '',

      tableCheckedRows: []
    }
  },

  computed: {
    usersCount () {
      return Object.keys(this.$store.state.users).length
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
      this.status = 'Preparing files'

      this.$wt.seed(file, {
        announceList: [this.$ANNOUNCE_URLS],
        name: file.name
      }, (torrent) => {
        this.status = ''

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
          mine: false
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
        this.onTorrent(torrent, index)
      })
      return null
    },

    resumeTorrent () {
      for (const torrent of this.tableCheckedRows) {
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
      for (const torrent of this.tableCheckedRows) {
        if (!torrent.destroy) continue
        torrent.destroy()

        this.$delete(this.torrents, this.getIndexOfTorrent(torrent.infoHash))
        this.tableCheckedRows = []
      }
    },

    getIndexOfTorrent (infoHash) {
      for (const index in this.torrents) {
        if (this.torrents[index].infoHash === infoHash) {
          return index
        }
      }
      return null
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
      }
    })
  }
}
</script>

<style scoped lang="sass">
.table
  margin-top: 20px

.drop-area
  padding: 40% 20px
</style>
