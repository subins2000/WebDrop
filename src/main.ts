import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import VueClipboard from 'vue-clipboard2'

import Bowser from 'bowser'
import WebTorrent from 'webtorrent'

Vue.use(Buefy)
Vue.use(VueClipboard)

Vue.config.productionTip = false

let announceURLs = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.sloppyta.co:443/announce',
  'wss://tracker.novage.com.ua:443/announce',
  'wss://tracker.btorrent.xyz:443/announce'
]

if (window.location.hostname === 'localhost') {
  announceURLs = ['ws://localhost:5000']
}

Vue.prototype.$ANNOUNCE_URLS = announceURLs
Vue.prototype.$INTERNET_ROOM_CODE_LENGTH = 4
Vue.prototype.$INTERNET_ROOM_SHARE_LINK = 'https://ShareThisFile.Online/#/?room='

Vue.prototype.$p2pt = null
Vue.prototype.$wt = new WebTorrent()

let myColor = sessionStorage.getItem('myColor')
let myName = sessionStorage.getItem('myName')

if (!myColor) {
  // random color
  myColor = `hsla(${~~(360 * Math.random())},70%,60%,1)`
  sessionStorage.setItem('myName', myColor)
}

if (!myName) {
  const bowser = Bowser.getParser(window.navigator.userAgent)

  myName = `${bowser.getOSName()} ${bowser.getBrowserName()}`
  sessionStorage.setItem('myName', myName)
}

store.commit('initProfile', {
  name: myName,
  color: myColor
})

Vue.filter('formatSize', function (size: number) {
  if (size > 1024 * 1024 * 1024 * 1024) {
    return (size / 1024 / 1024 / 1024 / 1024).toFixed(2) + ' TB'
  } else if (size > 1024 * 1024 * 1024) {
    return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  } else if (size > 1024 * 1024) {
    return (size / 1024 / 1024).toFixed(2) + ' MB'
  } else if (size > 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  }
  return size.toString() + ' B'
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
