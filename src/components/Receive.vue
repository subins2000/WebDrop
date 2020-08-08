<template>
  <div>
    <b-navbar class="navbar is-primary is-active has-text-white has-shadow" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item tag="router-link" :to="{ path: '/' }">
          <h1 class="is-size-4">WebDrop</h1>
        </b-navbar-item>
        <b-navbar-item tag="div">
          Shares
        </b-navbar-item>
      </template>
    </b-navbar>
    <div class="container">
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
          <tr v-for="(file, key, index) in files" :key="file.infoHash">
            <td>{{index + 1}}</td>
            <td>
              <div class="filename">
                {{file.name}}
              </div>
              <div class="progress" v-if="file.progress !== '0'">
                <progress class="progress" v-bind:value="file.progress" max="1">15%</progress>
              </div>
            </td>
            <td>{{file.length | formatSize}}</td>
            <td>{{file.downloadSpeed | formatSize}}</td>
            <td><a class="button is-primary" v-on:click="download" v-bind:download="file.name" v-bind:href="file.download">Download</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Shares',

  data () {
    return {
      files: {}
    }
  },

  methods: {
    init () {
      const set = this.$set
      const onShare = (share) => {
        for (const key in share.files) {
          const file = share.files[key]

          this.$set(this.files, share.infoHash + file.name, {
            name: this.$store.state.receivedFiles[share.infoHash],
            infoHash: share.infoHash,
            progress: file.progress,
            length: file.length,
            downloadSpeed: share.downloadSpeed,
            download: ''
          })

          const item = this.files[share.infoHash + file.name]

          file.getBlobURL(function (err, url) {
            if (err) throw err
            set(item, 'progress', '1')
            set(item, 'download', url)
            return url
          })
        }
      }

      for (const infoHash in this.$store.state.receivedFiles) {
        if (this.$wt.get(infoHash)) {
          onShare(this.$wt.get(infoHash))
        } else {
          this.$wt.add(infoHash, {
            announce: this.$ANNOUNCE_URLS
          }, onShare)
        }
      }
    },

    download (e) {
      console.log(e.target.id)
    }
  },

  mounted () {
    this.init()

    this.$store.subscribe((mutation) => {
      if (mutation.type === 'receiveFile') {
        this.init()
      }
    })
  }
}
</script>

<style lang="sass" scoped>
.container
  padding: 20px 0

  .actions .button
    margin-right: 10px

.table
  margin-top: 20px

@media screen and (max-width: 960px)
  .container
    padding: 20px 5%

@media screen and (min-width: 900px)
  .container
    max-width: 900px
</style>
