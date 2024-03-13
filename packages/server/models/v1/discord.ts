import type { TextChannel, Message } from 'discord.js'
import type {
  EmojiType,
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
  MessageFiltersType,
} from '@global/types/dist/discord'

import shuffleArray from 'knuth-shuffle-seeded'

import DiscordClient from '../../services/discord'

import { Logger } from '@global/utils'

const Discord = DiscordClient.getInstance()

const RANDOM_SEED = Number(process.env.VITE_RANDOM_SEED) || 7

export const getEmojis = async (): Promise<EmojiType[]> => {
  Logger.info('Getting emojis')

  const emojis = Discord.emojis.cache.toJSON()

  Logger.info('Got emojis', emojis.length)

  return emojis.map((e) => ({
    id: e.id,
    imageURL: e.imageURL(),
    name: e.name || e.id,
  }))
}

// Public methods
export const getMessages = async (
  params: GetMessagesParamsType,
): Promise<MessageResponseType[]> => {
  Logger.info('Getting messages', params)

  const { channels, shuffle } = params

  let messages: Message[] = []

  for (const item of channels) {
    const { id, after, around, before, filters, limit } = item

    const channel = Discord.channels.cache.get(id) as TextChannel

    const fetchedMessages = await channel.messages.fetch({ limit, before, after, around })

    const filteredMessages = filterMessages(fetchedMessages.toJSON(), filters)

    messages.push(...filteredMessages)
  }

  Logger.info('All messages fetched', messages.length)

  if (shuffle) {
    messages = shuffleArray(messages, RANDOM_SEED)
  }

  return messages.map(parseMessage)
}

export const getChannels = async (
  params: GetChannelsParamsType,
): Promise<ChannelResponseType[]> => {
  Logger.info('Getting channels')

  const channels = Discord.channels.cache
    .filter((channel) => channel.type === params.channelType)
    .toJSON() as TextChannel[]

  Logger.info('Got channels', channels.length)

  return channels.map((channel) => ({
    id: channel.id,
    name: channel.name,
    type: channel.type,
    url: channel.url,
  }))
}

// Internal methods

function parseMessage(message: Message): MessageResponseType {
  return {
    id: message.id,
    author: {
      id: message.author.id,
      username: message.author.username,
      globalName: message.author.globalName,
      discriminator: message.author.discriminator,
      accentColor: message.author.accentColor,
      avatar: message.author.avatarURL(),
    },
    content: message.content,
    timestamp: message.createdTimestamp,
    attachments: message.attachments.map((data) => ({
      id: data.id,
      description: data.description,
      contentType: data.contentType,
      size: data.size,
      url: data.url,
      height: data.height,
      width: data.width,
    })),
    reactions: message.reactions.cache.map((reaction) => ({
      id: reaction.emoji.id,
      count: reaction.count,
      name: reaction.emoji.name,
      imageURL: reaction.emoji.imageURL(),
    })),
  } as MessageResponseType
}

function filterMessages(messages: Message[], filters?: MessageFiltersType | null) {
  if (!filters) return messages

  return messages.filter((message) => {
    if (filters.hasAttachments && !message.attachments.size) return false

    if (filters.emojiName) {
      if (!message.reactions.cache.size) return false

      const reaction = message.reactions.cache.some(
        (reaction) => reaction.emoji.name === filters.emojiName,
      )

      if (!reaction) return false
    }

    return true
  })
}
