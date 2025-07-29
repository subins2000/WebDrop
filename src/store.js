import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware';

const useLocalStorageStore = create(
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

export default useLocalStorageStore;
