<template>
  <div>
    <b-navbar class="navbar selected is-active has-text-white has-shadow" :mobile-burger="false">
      <template slot="brand">
        <b-navbar-item>
          <b-button v-on:click="back">WebDrop</b-button>
        </b-navbar-item>
        <b-navbar-item>
          Send
        </b-navbar-item>
      </template>
    </b-navbar>
    <div class="container">
      <div class="actions">
        <FileUpload
          class="button is-primary"
          post-action="#"
          extensions="*"
          accept="*"
          :multiple="true"
          :size="1024 * 1024 * 10"
          v-model="files"
          @input-file="inputFile"
          ref="upload">
          <i class="fa fa-plus"></i>
          Select files
        </FileUpload>
        <b-button class="is-success" v-bind:click="sendAll" v-bind:disabled="files.length === 0">Send All</b-button>
        <span>
          <b-button class="is-text">
            {{ userSelected.length }} users
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
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(file, index) in files" :key="file.id">
            <td>{{index}}</td>
            <td>
              <img v-if="file.thumb" :src="file.thumb" width="40" height="auto" />
              <span v-else>No Image</span>
            </td>
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

  props: [
    'back',
    'userSelected'
  ],

  data () {
    return {
      files: []
    }
  },

  methods: {
    inputFile (file) {
      console.log(file)
    },

    sendAll () {
      
    }
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
