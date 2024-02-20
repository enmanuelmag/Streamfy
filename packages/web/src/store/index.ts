import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { UserType } from '@global/types/src/user'
import type { ChannelResponseType, MessageResponseType } from '@global/types/src/discord'

type StoreState = {
  volume: number
  user?: UserType | null
}

type Action = {
  setVolume: (volume: StoreState['volume']) => void
  setUser: (user: StoreState['user'] | null) => void
}
export const useStoreBase = create(
  persist<StoreState & Action>(
    (set) => ({
      user: null,
      volume: 0.1,
      setUser: (user) => set(() => ({ user })),
      setVolume: (volume) => set(() => ({ volume })),
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
  setMessages: (messages: LaughLossState['messages'] | null) => void
  setDiscordChannel: (discordChannel: LaughLossState['discordChannel'] | null) => void
  setCurrentMessage: (currentMessage: LaughLossState['currentMessage'] | null) => void
  reset: () => void
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
      reset: () => set(() => ({ discordChannel: null, messages: null, currentMessage: null })),
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
        reset: state.reset,
        setMessages: state.setMessages,
        setDiscordChannel: state.setDiscordChannel,
        setCurrentMessage: state.setCurrentMessage,
      }),
    },
  ),
)

type ConsultorioState = {
  discordChannel?: ChannelResponseType | null
  messages?: MessageResponseType[] | null
  currentMessage?: MessageResponseType | null
}

type ConsultorioAction = {
  setMessages: (messages: ConsultorioState['messages'] | null) => void
  setDiscordChannel: (discordChannel: ConsultorioState['discordChannel'] | null) => void
  setCurrentMessage: (currentMessage: ConsultorioState['currentMessage'] | null) => void
  reset: () => void
}

export const useStoreConsultorio = create(
  persist<ConsultorioState & ConsultorioAction>(
    (set) => ({
      discordChannel: null,
      messages: null,
      currentMessageId: null,
      setDiscordChannel: (discordChannel) => set(() => ({ discordChannel })),
      setMessages: (messages) => set(() => ({ messages })),
      setCurrentMessage: (currentMessage) => set(() => ({ currentMessage })),
      reset: () => set(() => ({ discordChannel: null, messages: null, currentMessage: null })),
    }),
    {
      name: 'storage-consultorio',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => key === 'currentMessage' || key === 'discordChannel',
          ),
        ),
        reset: state.reset,
        setMessages: state.setMessages,
        setDiscordChannel: state.setDiscordChannel,
        setCurrentMessage: state.setCurrentMessage,
      }),
    },
  ),
)
