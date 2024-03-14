import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { UserType } from '@global/types/src/user'
import type { ChannelResponseType, EmojiType, MessageResponseType } from '@global/types/src/discord'

const VERSION_STORAGE = 2

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
      name: `storage-base-${VERSION_STORAGE}`,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

type LaughLossState = {
  emoji?: EmojiType | null
  discordChannel?: ChannelResponseType | null
  messages?: MessageResponseType[] | null
  currentMessage?: MessageResponseType | null
}

type LaughLossAction = {
  setEmoji: (emoji: LaughLossState['emoji'] | null) => void
  setMessages: (messages: LaughLossState['messages'] | null) => void
  setDiscordChannel: (discordChannel: LaughLossState['discordChannel'] | null) => void
  setCurrentMessage: (currentMessage: LaughLossState['currentMessage'] | null) => void
  reset: () => void
}

export const useStoreLaughLoss = create(
  persist<LaughLossState & LaughLossAction>(
    (set) => ({
      emoji: null,
      discordChannel: null,
      messages: null,
      currentMessageId: null,
      setEmoji: (emoji) => set(() => ({ emoji })),
      setDiscordChannel: (discordChannel) => set(() => ({ discordChannel })),
      setMessages: (messages) => set(() => ({ messages })),
      setCurrentMessage: (currentMessage) => set(() => ({ currentMessage })),
      reset: () =>
        set(() => ({ discordChannel: null, messages: null, currentMessage: null, emoji: null })),
    }),
    {
      name: `storage-laughloss-${VERSION_STORAGE}`,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

type ConsultorioState = {
  emoji?: EmojiType | null
  publicChannel?: ChannelResponseType | null
  privateChannel?: ChannelResponseType | null
  messages?: MessageResponseType[] | null
  currentMessage?: MessageResponseType | null
}

type ConsultorioAction = {
  setEmoji: (emoji: ConsultorioState['emoji'] | null) => void
  setMessages: (messages: ConsultorioState['messages'] | null) => void
  setDiscordChannel: (
    type: 'publicChannel' | 'privateChannel',
    channel?: ChannelResponseType | null,
  ) => void
  setCurrentMessage: (currentMessage: ConsultorioState['currentMessage'] | null) => void
  reset: () => void
}

export const useStoreConsultorio = create(
  persist<ConsultorioState & ConsultorioAction>(
    (set) => ({
      emoji: null,
      publicChannel: null,
      privateChannel: null,
      messages: null,
      currentMessageId: null,
      setEmoji: (emoji) => set(() => ({ emoji })),
      setMessages: (messages) => set(() => ({ messages })),
      setCurrentMessage: (currentMessage) => set(() => ({ currentMessage })),
      reset: () =>
        set(() => ({
          discordChannel: null,
          messages: null,
          currentMessage: null,
          privateChannel: null,
          publicChannel: null,
          emoji: null,
        })),
      setDiscordChannel: (type, channel) => set(() => ({ [type]: channel })),
    }),
    {
      name: `storage-consultorio-${VERSION_STORAGE}`,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
