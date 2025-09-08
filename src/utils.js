import { useMainStore } from './store'

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