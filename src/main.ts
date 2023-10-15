import linkify from 'vue-linkify'
import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import PeerFiles from 'simple-peer-files'

import App from './App.vue'
import router from './router'
import store from './store'
import registerWorker from './registerServiceWorker'

import Header from './components/Header.vue'

import Button from 'buefy/dist/components/button'
import Checkbox from 'buefy/dist/components/checkbox'
import Field from 'buefy/dist/components/field'
import Input from 'buefy/dist/components/input'
import Navbar from 'buefy/dist/components/navbar'
import Progress from 'buefy/dist/components/progress'
import Tabs from 'buefy/dist/components/tabs'
import Table from 'buefy/dist/components/table'
import Tag from 'buefy/dist/components/tag'
import Tooltip from 'buefy/dist/components/tooltip'
import Upload from 'buefy/dist/components/upload'
import Toast from 'buefy/dist/components/toast'
import Snackbar from 'buefy/dist/components/snackbar'

Vue.use(VueClipboard)

// load only needed buefy components
const comps = [
  Button,
  Checkbox,
  Field,
  Input,
  Navbar,
  Progress,
  Tabs,
  Table,
  Tag,
  Toast,
  Tooltip,
  Snackbar,
  Upload
]

for (const comp of comps) {
  Vue.use(comp)
}

Vue.component('Header', Header)
Vue.directive('linkified', linkify)

let announceURLs = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce'
  // 'ws://192.168.100.7:5000'
]

if (window.location.hostname === 'localhost') {
  announceURLs = ['ws://0.0.0.0:5000']
}

const INTERNET_ROOM_CODE_LENGTH = 4

Vue.prototype.$ANNOUNCE_URLS = announceURLs
Vue.prototype.$INTERNET_ROOM_CODE_LENGTH = INTERNET_ROOM_CODE_LENGTH
Vue.prototype.$INTERNET_ROOM_SHARE_LINK = 'https://WebDrop.Space/#/?room='

Vue.prototype.$p2pt = null
Vue.prototype.$pf = new PeerFiles()

Vue.prototype.$validateRoomCode = (roomCode: string) => {
  return roomCode.length === INTERNET_ROOM_CODE_LENGTH
}

store.commit('initSettings')

const vue = new Vue({
  router,
  store,
  render: h => h(App),
  mounted: () => document.dispatchEvent(new Event('x-app-rendered'))
}).$mount('#app')

registerWorker(vue)
