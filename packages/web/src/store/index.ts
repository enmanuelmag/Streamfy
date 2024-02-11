import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { UserType } from '@global/types/src/user'

interface StoreState {
  user?: UserType | null
}

type Action = {
  setUser: (user: StoreState['user'] | null) => void
}

// export const useStoreBase = create<StoreState & Action>((set) => ({
//   user: null,
//   setUser: (user) => set(() => ({ user })),
// }))

export const useStoreBase = create(
  persist<StoreState & Action>(
    (set) => ({
      user: null,
      setUser: (user) => set(() => ({ user })),
    }),
    {
      name: 'storage-base',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
