import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { UserType } from '@global/types/src/user'
import type { MessageResponseType } from '@global/types/src/discord'

interface StoreState {
  user?: UserType | null
}

type Slices = {
  laughLoss: {
    discordChannel: {
      id: string
      name: string
    } | null
    currentMessageId: string | null
    messages: MessageResponseType[] | null
  }
  baityConsult: {
    discordChannel: {
      id: string
      name: string
    } | null
    currentMessageId: string | null
    messages: MessageResponseType[] | null
  }
}

type Action = {
  setUser: (user: StoreState['user'] | null) => void
  setDiscordChannel: (
    slice: 'laughLoss' | 'baityConsult',
    channel: Slices['laughLoss']['discordChannel'],
  ) => void
  setMessages: (
    slice: 'laughLoss' | 'baityConsult',
    messages: Slices['laughLoss']['messages'],
  ) => void
}
export const useStoreBase = create(
  persist<StoreState & Action & Slices>(
    (set) => ({
      user: null,
      setUser: (user) => set(() => ({ user })),
      setDiscordChannel: (slice, channel) => {
        set((state) => ({
          [slice]: {
            ...state[slice],
            discordChannel: channel,
          },
        }))
      },
      setMessages: (slice, messages) => {
        set((state) => ({
          [slice]: {
            ...state[slice],
            messages,
          },
        }))
      },
      laughLoss: {
        discordChannel: null,
        currentMessageId: null,
        messages: null,
      },
      baityConsult: {
        discordChannel: null,
        currentMessageId: null,
        messages: null,
      },
    }),
    {
      name: 'storage-base',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
