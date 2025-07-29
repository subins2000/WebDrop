import P2PT from 'p2pt'

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

export const startP2PT = (roomId, persistentStore, mainStore) => {
  const p2pt = new P2PT(announceURLs)
  p2pt.setIdentifier('webdrop' + roomId)

  p2pt.on('peerconnect', (peer) => {
    p2pt.send(peer, {
      type: 'init',
      name: persistentStore.name,
      // color: this.$store.state.settings.color,
      // sharesCount: Object.keys(mainStore.shares).length,
      // msgsCount: mainStore.msgs.length
    })
  })

  p2pt.on('msg', (peer, msg) => {
    if (typeof msg !== 'object') return

    const type = msg.type

    if (type === 'getShares') {
      this.sendSharesState(p2pt, peer)
    } else if (type === 'getMsgs') {
      this.sendMsgsState(p2pt, peer)
    } else if (type === 'init') {
      mainStore.addUser({
        id: peer.id,
        name: msg.name,
        // color: msg.color,
        conn: peer
      })

      if (msg.sharesCount > Object.keys(mainStore.shares).length) {
        p2pt.send(peer, {
          type: 'getShares'
        })
      }

      if (msg.msgsCount > mainStore.msgs.length) {
        p2pt.send(peer, {
          type: 'getMsgs'
        })
      }
    } else if (type === 'ping') {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: `<b>${this.$store.state.users[peer.id].name}</b> pinged!`,
        type: 'is-warning',
        queue: false
      })
    } else if (type === 'newShare') {
      delete msg.type
      msg.peer = peer

      mainStore.newShare(msg)
    } else if (type === 'startSending') {
      const shareId = msg.shareId
      const share = mainStore.shares[shareId]

      if (share && share.file && !share.paused) {
        p2pt.send(peer, shareId, share.file).then(transfer => {
          mainStore.setTransfer({
            shareId,
            transfer
          })

          let prevBytes = 0
          transfer.on('progress', (progress, receivedBytes) => {
            // parseInt will make it single digit
            progress = parseInt(progress)

            const bytesTransferred = receivedBytes - prevBytes
            prevBytes = receivedBytes

            this.$store.dispatch(
              'uploadProgress', {
                shareId,
                userId: peer.id,
                progress,
                bytes: bytesTransferred
              }
            )
          })

          transfer.on('done', () => mainStore.removeTransfer({
            shareId,
            userId: transfer.peer._id
          }))

          transfer.start()
        })
      }
    } else if (type === 'msg') {
      // msg exist check
      if (msg.id && mainStore.msgs[msg.id]) {
        return
      }

      // msgs being restored will have name & color with them
      if (!msg.name) {
        msg.name = mainStore.users[peer.id].name
        msg.color = mainStore.users[peer.id].color
      }

      delete msg.type

      mainStore.addMessage(msg)

      // copy to clipboard ?
      if (persistentStore.autoCopy) {
        this.$copyText(msg.msg).then(_ => {
          this.$buefy.toast.open({
            duration: 2000,
            message: 'Message Copied !',
            position: 'is-top',
            type: 'is-primary'
          })
        })
      }
    }
  })

  p2pt.on('peerclose', (peer) => {
    mainStore.removeUser(peer.id)
  })

  let warningCount = 0
  let trackerConnected = false
  let warningMsg = false

  p2pt.on('trackerwarning', (error, stats) => {
    warningCount++
    console.log(error)

    if (warningCount >= stats.total && !trackerConnected && !warningMsg) {
      warningMsg = this.$buefy.snackbar.open({
        message: 'We couldn\'t connect to any WebTorrent trackers. Your ISP might be blocking them 🤔',
        position: 'is-top',
        type: 'is-danger',
        queue: false,
        indefinite: true,
        actionText: 'Retry',
        onAction: () => {
          if (!trackerConnected) {
            this.$store.commit('destroyP2PT')
            p2pt.destroy()
            // this.startP2PT(identifier)
          }
          warningMsg.close()
        }
      })
    }
  })

  p2pt.on('trackerconnect', () => {
    trackerConnected = true
    if (warningMsg) warningMsg.close()
  })

  mainStore.setValue('p2pt', p2pt)
  p2pt.start()
}
