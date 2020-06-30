<template>
  <div>
    <b-navbar class="is-success" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <div class="actions">
          <b-navbar-item tag="div">
            <b-button type="is-primary" v-show="files.length > 0">Notify All</b-button>
          </b-navbar-item>
        </div>
      </template>
    </b-navbar>
    <div class="container">
      <div class="actions content">
        <FileUpload
          class="button is-success"
          post-action="#"
          extensions="*"
          accept="*"
          :multiple="true"
          :size="1024 * 1024 * 10"
          v-model="files"
          @input-file="makeTorrent"
          ref="upload">
          Add File
        </FileUpload>
        <span>
          <b-button class="is-text">
            {{ usersCount }} users
          </b-button>
        </span>
        <span>
          <b-button class="is-text">
            {{ status }}
          </b-button>
        </span>
      </div>
      <div>
        <b-field grouped group-multiline>
          <div class="control">
            <b-button @click="resumeTorrent">Resume</b-button>
          </div>
          <div class="control">
            <b-button type="is-warning" @click="pauseTorrent">Pause</b-button>
          </div>
        </b-field>
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
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Send',

  data () {
    return {
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
    makeTorrent () {
      for (const key in this.files) {
        this.status = 'Preparing files'

        const file = this.files[key].file

        this.$wt.seed(file, {
          announceList: [this.$ANNOUNCE_URLS],
          name: file.name
        }, (torrent) => {
          this.status = ''

          this.onTorrent(torrent)

          this.$store.commit('addTorrent', {
            i: torrent.infoHash,
            n: torrent.name
          })
        })

        console.log(this.files)
        this.$refs.upload.remove(key)
        console.log(this.files)
      }
    },

    onTorrent (torrent) {
      // torrent will have only one file
      const file = torrent.files[0]

      torrent.remaining = ''
      this.$set(this.torrents, this.torrents.length, torrent)
    },

    resumeTorrent () {
      for (const key in this.tableCheckedRows) {
        this.torrents[key].resume()
      }
    },

    pauseTorrent () {
      for (const key in this.tableCheckedRows) {
        this.torrents[key].pause()
      }
    }
  },

  mounted () {
    if (this.$p2pt === null) {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="sass">
.container
  .actions .button
    margin-right: 10px

.table
  margin-top: 20px
</style>
