import P2PT from 'p2pt'
import { toast } from 'react-toastify'
import { usePersistentStore, useMainStore } from './store'
import { sendMsgsState, sendSharesState } from './utils'

// Utility function to copy text to clipboard
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

let announceURLs = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.btorrent.xyz',
  'wss://tracker.files.fm:7073/announce'
  // 'ws://192.168.100.7:5000'
]

if (window.location.hostname === 'localhost') {
  announceURLs = ['ws://localhost:5000']
}

export const startP2PT = (roomId) => {
  const p2pt = new P2PT(announceURLs)
  p2pt.setIdentifier('webdrop' + roomId)

  p2pt.on('peerconnect', (peer) => {
    // Get current state from the store
    const currentState = useMainStore.getState()

    p2pt.send(peer, {
      type: 'init',
      name: usePersistentStore.getState().name,
      // color: this.$store.state.settings.color,
      sharesCount: Object.keys(currentState.shares).length,
      msgsCount: currentState.msgs.length
    })
  })

  p2pt.on('msg', (peer, msg) => {
    if (typeof msg !== 'object') return

    const type = msg.type

    if (type === 'getShares') {
      sendSharesState(p2pt, peer)
    } else if (type === 'getMsgs') {
      sendMsgsState(p2pt, peer)
    } else if (type === 'init') {
      console.log(msg)

      useMainStore.getState().addUser({
        id: peer.id,
        name: msg.name,
        // color: msg.color,
        conn: peer
      })

      const currentState = useMainStore.getState()
      if (msg.sharesCount > Object.keys(currentState.shares).length) {
        p2pt.send(peer, {
          type: 'getShares'
        })
      }

      if (msg.msgsCount > currentState.msgs.length) {
        p2pt.send(peer, {
          type: 'getMsgs'
        })
      }
    } else if (type === 'ping') {
      const currentState = useMainStore.getState()
      const userName = currentState.users[peer.id]?.name || 'Unknown'
      toast.warning(`${userName} pinged!`, {
        autoClose: 3000,
        position: 'top-right'
      })
    } else if (type === 'newShare') {
      delete msg.type
      msg.peer = peer

      useMainStore.getState().newShare(msg)
    } else if (type === 'startSending') {
      const shareId = msg.shareId
      const currentState = useMainStore.getState()
      const share = currentState.shares[shareId]

      if (share && share.file && !share.paused) {
        p2pt.send(peer, shareId, share.file).then(transfer => {
          useMainStore.getState().setTransfer({
            shareId,
            transfer
          })

          let prevBytes = 0
          transfer.on('progress', (progress, receivedBytes) => {
            // parseInt will make it single digit
            progress = parseInt(progress)

            const bytesTransferred = receivedBytes - prevBytes
            prevBytes = receivedBytes

            // Note: You'll need to implement uploadProgress in your store
            // mainStore.uploadProgress({
            //   shareId,
            //   userId: peer.id,
            //   progress,
            //   bytes: bytesTransferred
            // })
          })

          transfer.on('done', () => useMainStore.getState().removeTransfer({
            shareId,
            userId: transfer.peer._id
          }))

          transfer.start()
        })
      }
    } else if (type === 'msg') {
      const currentState = useMainStore.getState()
      
      // msg exist check
      if (msg.id && currentState.msgs[msg.id]) {
        return
      }

      // msgs being restored will have name & color with them
      if (!msg.name) {
        msg.name = currentState.users[peer.id].name
        msg.color = currentState.users[peer.id].color
      }

      delete msg.type

      useMainStore.getState().addMessage(msg)

      // copy to clipboard ?
      if (usePersistentStore.getState().autoCopy) {
        copyText(msg.msg).then(success => {
          if (success) {
            toast.success('Message Copied!', {
              autoClose: 2000,
              position: 'top-right'
            })
          }
        })
      }
    }
  })

  p2pt.on('peerclose', (peer) => {
    useMainStore.getState().removeUser(peer.id)
  })

  let warningCount = 0
  let trackerConnected = false
  let warningMsg = false

  p2pt.on('trackerwarning', (error, stats) => {
    warningCount++
    console.log(error)

    if (warningCount >= stats.total && !trackerConnected && !warningMsg) {
      warningMsg = toast.error('We couldn\'t connect to any WebTorrent trackers. Your ISP might be blocking them 🤔', {
        position: 'top-right',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        action: {
          label: 'Retry',
          onClick: () => {
            if (!trackerConnected) {
              useMainStore.getState().destroyP2PT()
              p2pt.destroy()
              // startP2PT(roomId, persistentStore, mainStore)
            }
            warningMsg = null
          }
        }
      })
    }
  })

  p2pt.on('trackerconnect', () => {
    trackerConnected = true
    if (warningMsg) {
      toast.dismiss(warningMsg)
      warningMsg = null
    }
  })

  useMainStore.getState().setValue('p2pt', p2pt)
  p2pt.start()
}
