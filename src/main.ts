import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import * as P2PT from 'p2pt'

Vue.use(Buefy)

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

Vue.prototype.$p2pt = new P2PT(announceURLs, 'aa')

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
