<template>
  <div class="container">
    <div class="content">
      <h2>Settings</h2>
      <b-field label="Device Name">
        <b-input v-model="settings.name" maxlength="30"></b-input>
      </b-field>
      <div class="field">
        <label class="label">Auto Start</label>
        <div class="control">
          <b-checkbox v-model="settings.autoStart">Start downloading files on receive</b-checkbox>
        </div>
      </div>
      <div class="field">
        <label class="label">Start Downloading In Browser</label>
        <div class="control">
          <b-checkbox v-model="settings.autoBrowserDownload">Start downloading files via browser download manager on receive</b-checkbox>
        </div>
      </div>
      <div class="field">
        <label class="label">Auto Copy</label>
        <div class="control">
          <b-checkbox v-model="settings.autoCopy">Copy message to clipboard on receive</b-checkbox>
        </div>
      </div>
      <div class="field">
        <label class="label">Default Tab</label>
        <div class="control">
          <b-checkbox v-model="settings.defaultTab" true-value="1" false-value="0">Make <b>Messages</b> tab the default</b-checkbox>
        </div>
      </div>
      <div class="field">
        <label class="label">Animations</label>
        <div class="control">
          <b-checkbox v-model="settings.anim">Animations & Transitions</b-checkbox>
        </div>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-success" @click="save">Save</button>
        </div>
        <div class="control">
          <button class="button is-light" @click="init">Reset</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',

  data () {
    return {
      settings: {}
    }
  },

  computed: {
  },

  methods: {
    init () {
      this.settings = Object.assign({}, this.settings, this.$store.state.settings)
    },

    save () {
      this.$buefy.toast.open({
        duration: 2000,
        message: 'Saved Settings',
        position: 'is-bottom',
        type: 'is-success'
      })
      this.$store.commit('updateSettings', this.settings)
    }
  },

  mounted () {
    this.init()
  }
}
</script>

<style lang="sass">
.control .help.counter
  float: right
  margin-left: .5em
</style>
