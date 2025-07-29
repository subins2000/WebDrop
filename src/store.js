import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';

export const useLocalStorageStore = create(
  persist(
    (set) => ({
      name: "Device",
      setValue: (key, value) => set({ [key]: value })
    }), {
      name: 'store',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export const useMainStore = create(
  (set) => ({
    p2pt: null,
    users: {},

    shares: {},
    msgs: [],

    setValue: (key, value) => set({ [key]: value }),

    addUser: (user) => set((state) => ({ users: { ...state.users, [user.id]: user } })),
    removeUser: (id) => set((state) => {
      const users = { ...state.users }
      delete users[id]
      return { users }
    }),

    // share added by user
    addShare: (payload) => set((state) => (
      {
        shares: {
          ...state.shares,
          [payload.shareId]: {
            ...payload,
            ...{
              mine: true, // I'm the sender
              transfers: []
            }
          }
        }
      }
    )),

    // share received from a peer
    newShare: (payload) => set((state) => (
      {
        shares: {
          ...state.shares,
          [payload.shareId]: {
            ...payload,
            ...{
              mine: false, // I'm the receiver
              transfers: []
            }
          }
        }
      }
    )),

    removeShare: (shareID) => set((state) => {
      const shares = { ...state.shares }

      shares[shareID].transfers.forEach(t => {
        t.cancel()
      })

      delete shares[shareID]
      return { shares }
    }),

    setTransfer: (payload) => set((state) => ({
      shares: {
        ...state.shares,
        [payload.shareId]: {
          ...state.shares[payload.shareId],
          transfers: [...state.shares[payload.shareId].transfers, payload.transfer]
        }
      }
    })),

    // This is called when a transfer is completed
    removeTransfer: (payload) => set((state) => ({
      shares: {
        ...state.shares,
        [payload.shareId]: {
          ...state.shares[payload.shareId],
          transfers: state.shares[payload.shareId].transfers.filter(t => t.peer._id !== payload.userID)
        }
      }
    })),

    addMessage: (msg) => set((state) => ({ msgs: [...state.msgs, msg] })),
  })
)
