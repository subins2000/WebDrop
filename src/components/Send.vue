<template>
  <div>
    <b-navbar class="navbar has-text-white has-shadow" v-bind:class="files.length > 0 ? 'is-warning' : 'is-success'" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <div class="actions">
          <b-navbar-item tag="div">
            <b-button type="is-primary" size="is-medium" v-on:click="sendAll" v-show="files.length > 0">Send All</b-button>
          </b-navbar-item>
        </div>
      </template>
    </b-navbar>
    <div class="container">
      <div class="actions">
        <FileUpload
          class="button is-success"
          post-action="#"
          extensions="*"
          accept="*"
          :multiple="true"
          :size="1024 * 1024 * 10"
          v-model="files"
          ref="upload">
          Select files
        </FileUpload>
        <span>
          <b-button class="is-text">
            {{ selectedUsers.length }} users
          </b-button>
        </span>
      </div>
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Size</th>
            <th>Speed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(file, index) in files" :key="file.id">
            <td>{{index + 1}}</td>
            <td>
              <div class="filename">
                {{file.name}}
              </div>
              <div class="progress" v-if="file.active || file.progress !== '0.00'">
                <div :class="{'progress-bar': true, 'progress-bar-striped': true, 'bg-danger': file.error, 'progress-bar-animated': file.active}" role="progressbar" :style="{width: file.progress + '%'}">{{file.progress}}%</div>
              </div>
            </td>
            <td>{{file.size | formatSize}}</td>
            <td>{{file.speed | formatSize}}</td>

            <td v-if="file.error">{{file.error}}</td>
            <td v-else-if="file.success">success</td>
            <td v-else-if="file.active">active</td>
            <td v-else>
              <b-button @click.prevent="$refs.upload.remove(file)">Remove</b-button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Send',

  data () {
    return {
      files: [],
      selectedUsers: this.$store.state.selectedUsers
    }
  },

  methods: {
    sendAll () {
      const files = []

      for (const key in this.files) {
        files.push(this.files[key].file)
      }

      this.$wt.seed(files, {
        announceList: [this.$ANNOUNCE_URLS],
        name: files[0].name
      }, (torrent) => {
        for (const userID of this.selectedUsers) {
          const conn = this.$store.state.users[userID].conn
          this.$p2pt.send(conn, JSON.stringify({
            type: 'send',
            name: this.files[0].name,
            infoHash: torrent.infoHash
          }))
        }
      })
    }
  },

  mounted () {
    if (this.selectedUsers.length === 0) {
      this.$router.push('/')
    }
  },

  beforeRouteLeave (to, from, next) {
    this.$store.commit('clearSelectedUsers')
    next(true)
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
