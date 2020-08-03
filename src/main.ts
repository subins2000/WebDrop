import linkify from 'vue-linkify'
import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
import WebTorrent from 'webtorrent'

import App from './App.vue'
import router from './router'
import store from './store'
import registerWorker from './registerServiceWorker'

import Header from './components/Header.vue'

import Button from 'buefy/dist/components/button'
import Checkbox from 'buefy/dist/components/checkbox'
import Field from 'buefy/dist/components/field'
import Input from 'buefy/dist/components/input'
import Modal from 'buefy/dist/components/modal'
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
  Modal,
  Navbar,
  Progress,
  Tabs,
  Table,
  Tag,
  Tooltip,
  Snackbar,
  Toast,
  Upload
]

for (const comp of comps) {
  Vue.use(comp)
}

Vue.component('Header', Header)
Vue.directive('linkified', linkify)

let announceURLs = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.sloppyta.co:443/announce',
  'wss://tracker.novage.com.ua:443/announce',
  'wss://tracker.btorrent.xyz:443/announce',
  'wss://track.file.pizza:443/announce'
  // 'ws://10.42.0.1:5000'
]

if (window.location.hostname === 'localhost') {
  announceURLs = ['ws://0.0.0.0:5000']
}

Vue.prototype.$ANNOUNCE_URLS = announceURLs
Vue.prototype.$INTERNET_ROOM_CODE_LENGTH = 4
Vue.prototype.$INTERNET_ROOM_SHARE_LINK = 'https://WebDrop.Space/#/?room='

Vue.prototype.$p2pt = null
Vue.prototype.$wt = new WebTorrent()

store.commit('initSettings')

const vue = new Vue({
  router,
  store,
  render: h => h(App),
  mounted: () => document.dispatchEvent(new Event('x-app-rendered'))
}).$mount('#app')

registerWorker(vue)
