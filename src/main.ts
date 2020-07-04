import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'

import WebTorrent from 'webtorrent'

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import device from './device'
import Header from './components/Header.vue'

import Button from 'buefy/dist/components/button'
import Field from 'buefy/dist/components/field'
import Modal from 'buefy/dist/components/modal'
import Navbar from 'buefy/dist/components/navbar'
import Switch from 'buefy/dist/components/switch'
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
  Field,
  Modal,
  Navbar,
  Tabs,
  Table,
  Tag,
  Tooltip,
  Snackbar,
  Switch,
  Toast,
  Upload
]

for (const comp of comps) {
  Vue.use(comp)
}

Vue.component('Header', Header)

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

// Length limit to prevent malicious inputs
if (!myColor || myColor.length > 20) {
  // random color
  myColor = `hsla(${~~(360 * Math.random())},60%,60%,1)`
  sessionStorage.setItem('myColor', myColor)
}

if (!myName || myName.length > 30) {
  myName = `${device.os} ${device.browser}`
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

Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.eventSetDrag = function () {
      el.setAttribute('data-dragging', 'yes')
    }
    el.eventClearDrag = function () {
      el.removeAttribute('data-dragging')
    }
    el.eventOnClick = function (event) {
      const dragging = el.getAttribute('data-dragging')
      // Check that the click was outside the el and its children, and wasn't a drag
      if (!(el === event.target || el.contains(event.target)) && !dragging) {
        // call method provided in attribute value
        vnode.context[binding.expression](event)
      }
    }
    document.addEventListener('touchstart', el.eventClearDrag)
    document.addEventListener('touchmove', el.eventSetDrag)
    document.addEventListener('click', el.eventOnClick)
    document.addEventListener('touchend', el.eventOnClick)
  },
  unbind: function (el) {
    document.removeEventListener('touchstart', el.eventClearDrag)
    document.removeEventListener('touchmove', el.eventSetDrag)
    document.removeEventListener('click', el.eventOnClick)
    document.removeEventListener('touchend', el.eventOnClick)
    el.removeAttribute('data-dragging')
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
