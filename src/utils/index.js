import { useMainStore, usePersistentStore } from '../store'
import device from './device'

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
