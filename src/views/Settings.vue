<template>
  <div class="container">
    <div class="content">
      <h2>Settings</h2>
      <b-field label="Device Name">
        <b-input v-model="settings.name" maxlength="30"></b-input>
      </b-field>
      <div class="field">
        <label class="label">Device Color</label>
        <div class="control">
          <span class="device-color" v-for="(color, index) in colors" :key="index" v-bind:class="{ selected: color == settings.color }" v-bind:style="{ 'background-color': color }" @click="settings.color = color"></span>
          <p>Requires a reload for color change to take effect</p>
        </div>
      </div>
      <div class="field">
        <label class="label">Auto Start</label>
        <div class="control">
          <b-checkbox v-model="settings.autoStart">Start downloading files on receive</b-checkbox>
        </div>
      </div>
      <div class="field">
        <label class="label">Auto Start Downloading In Browser</label>
        <div class="control">
          <b-checkbox v-model="settings.autoBrowserDownload">Start downloading files via browser download manager on receive</b-checkbox><br/>
          (Won't work in some browsers)
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
      colors: [],
      settings: {}
    }
  },

  methods: {
    init () {
      this.settings = Object.assign({}, this.settings, this.$store.state.settings)

      const colors = [this.settings.color]
      let i = 0
      while (i < 10) {
        const color = `hsla(${~~(360 * Math.random())},60%,60%,1)`
        if (colors.indexOf(color) === -1) {
          colors.push(color)
          i++
        }
      }
      this.colors = colors
    },

    save () {
      this.$buefy.toast.open({
        duration: 2000,
        message: 'Settings Saved',
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

.device-color
  display: inline-block
  margin-right: 5px
  height: 30px
  width: 30px

.device-color.selected
  border: 2px solid #000
</style>
