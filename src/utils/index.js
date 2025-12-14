import { useMainStore, usePersistentStore } from '../store'
import device from './device'
import sha1 from 'simple-sha1'

export const initPersistentStore = () => {
  const name = usePersistentStore.getState().name
  if (!name || name.length > 30) {
    usePersistentStore.getState().setValue('name', `${device.os} ${device.browser}`)
  }

  const color = usePersistentStore.getState().color
  if (!color) {
    // random color
    usePersistentStore.getState().setValue('color', `hsla(${~~(360 * Math.random())},60%,60%,1)`)
  }
}

export const getP2PT = () => {
  return useMainStore.getState().p2pt
}

export const sendSharesState = (p2pt, peer) => {
  for (const infoHash in useMainStore.getState().shares) {
    let share = useMainStore.getState().shares[infoHash]

    // only send shares created by me
    if (!share.mine) continue

    share = {
      ...share,
      ...{
        type: 'newShare',
        i: infoHash
      }
    }
    p2pt.send(peer, share)
  }
}

export const sendMsgsState = (p2pt, peer) => {
  for (const id in useMainStore.getState().msgs) {
    const msg = useMainStore.getState().msgs[id]
    p2pt.send(peer, {
      ...msg,
      ...{
        type: 'msg',
        id: id
      }
    })
  }
}

export const makeShare = (file) => {
  const shareID = sha1.sync(file.name + file.size)

  if (useMainStore.getState().shares[shareID]) return

  const share = {
    shareID,
    file,
    name: file.name,
    size: file.size,
    paused: false
  }

  useMainStore.getState().addShare(share)

  // let peers know of this share
  for (const [_, user] of Object.entries(useMainStore.getState().users)) {
    getP2PT().send(user.conn, {
      type: "newShare",
      shareInfo: share
    })
  }
}

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
