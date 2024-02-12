import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { UserType } from '@global/types/src/user'
import type { ChannelResponseType, MessageResponseType } from '@global/types/src/discord'

type StoreState = {
  user?: UserType | null
}

type Action = {
  setUser: (user: StoreState['user'] | null) => void
}
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

type LaughLossState = {
  discordChannel?: ChannelResponseType | null
  messages?: MessageResponseType[] | null
  currentMessage?: MessageResponseType | null
}

type LaughLossAction = {
  setDiscordChannel: (discordChannel: LaughLossState['discordChannel'] | null) => void
  setMessages: (messages: LaughLossState['messages'] | null) => void
  setCurrentMessage: (currentMessage: LaughLossState['currentMessage'] | null) => void
}

export const useStoreLaughLoss = create(
  persist<LaughLossState & LaughLossAction>(
    (set) => ({
      discordChannel: null,
      messages: null,
      currentMessageId: null,
      setDiscordChannel: (discordChannel) => set(() => ({ discordChannel })),
      setMessages: (messages) => set(() => ({ messages })),
      setCurrentMessage: (currentMessage) => set(() => ({ currentMessage })),
    }),
    {
      name: 'storage-laugh-loss',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => key === 'currentMessage' || key === 'discordChannel',
          ),
        ),
        setMessages: state.setMessages,
        setDiscordChannel: state.setDiscordChannel,
        setCurrentMessage: state.setCurrentMessage,
      }),
    },
  ),
)
