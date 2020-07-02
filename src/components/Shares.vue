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
            <div class="control" v-if="tableCheckedRows[0].mine">
              <b-button @click="resumeTorrent">Start</b-button>
            </div>
            <div class="control" v-else-if="tableCheckedRows[0].paused">
              <b-button @click="resumeTorrent">Resume</b-button>
            </div>
            <div class="control" v-else>
              <b-button type="is-warning" @click="pauseTorrent">Pause</b-button>
            </div>
          </b-field>
        </span>
        <span v-else>
          <b-field grouped group-multiline>
            <div class="control">
              <b-button @click="resumeTorrent">Resume</b-button>
            </div>
            <div class="control">
              <b-button type="is-warning" @click="pauseTorrent">Pause</b-button>
            </div>
          </b-field>
        </span>
      </div>
      <div v-else>
        <b-field grouped group-multiline>
          <div class="control">
            <b-button disabled>Resume</b-button>
          </div>
          <div class="control">
            <b-button disabled>Pause</b-button>
          </div>
        </b-field>
      </div>
      <b-table
        :data="torrents"
        :checked-rows.sync="tableCheckedRows"
        checkable
        checkbox-position="left">
        <template slot-scope="props">
          <b-table-column field="name" label="Name" width="40" v-bind:class="{ 'is-warning' : props.row.paused }">
            {{ props.row.name }}
          </b-table-column>
          <b-table-column field="size" label="Size" v-bind:class="{ 'is-warning' : props.row.paused }">
            {{ props.row.length | formatSize }}
          </b-table-column>
          <b-table-column v-if="props.row.done" field="finish" label="" class="is-success">
            <b-button >Download</b-button>
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

        this.onTorrent(torrent)
      })
    },

    onTorrent (torrent) {
      this.$store.commit('addTorrent', {
        i: torrent.infoHash,
        n: torrent.name,
        l: torrent.length
      })

      this.$set(this.torrents, this.torrents.length, torrent)
    },

    // add new torrent obtained from a peer
    addNewTorrent (torrentInfo) {
      const index = this.torrents.length
      this.$set(this.torrents, index, {
        infoHash: torrentInfo.i,
        name: torrentInfo.n,
        length: torrentInfo.l,
        mine: false
      })

      if (this.autoStart) {
        this.startTorrent(index)
      }
    },

    startTorrent (index) {
      this.$wt.add(this.torrents[index].infoHash, {
        announce: this.$ANNOUNCE_URLS
      }, (torrent) => {
        this.$set(this.torrents, index, torrent)
      })
    },

    resumeTorrent () {
      for (const key in this.tableCheckedRows) {
        const torrent = this.torrents[key]
        if (torrent.mine) {
          // torrent is not a WebTorrent object
          // make it one
          this.startTorrent(key)
        } else {
          torrent.resume()
        }
      }
    },

    pauseTorrent () {
      for (const key in this.tableCheckedRows) {
        const torrent = this.torrents[key]
        if (torrent.mine) continue
        console.log(torrent)
        torrent.pause()
      }
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
