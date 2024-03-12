import type { TextChannel, Message } from 'discord.js'
import type {
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/dist/discord'

import shuffleArray from 'knuth-shuffle-seeded'

import DiscordClient from '../../services/discord'

import { Logger } from '@global/utils'

const Discord = DiscordClient.getInstance()

const RANDOM_SEED = Number(process.env.VITE_RANDOM_SEED) || 7

// Public methods
export const getMessages = async (
  params: GetMessagesParamsType,
): Promise<MessageResponseType[]> => {
  Logger.info('Getting messages', params)

  const { channelIds, limit, before, after, around, regex, filters, shuffle } = params

  const channels = channelIds.map(
    (channelId) => Discord.channels.cache.get(channelId) as TextChannel,
  )

  if (!channels.length) {
    Logger.error('Channels not found', channelIds)
    throw new Error('Channel not found')
  }

  let messages: Message[] = []

  for (const channel of channels) {
    const fetchedMessages = await channel.messages.fetch({ limit, before, after, around })
    messages.push(...fetchedMessages.toJSON())
  }

  if (regex) {
    const regexPattern = new RegExp(regex)
    messages = messages.filter((message) => regexPattern.test(message.content))
  }

  Logger.info('Amount of messages', messages.length)

  const filteredMessages = filterMessages(messages, filters)

  Logger.info('Filtered messages', filteredMessages.length)

  const parsedMessages = filteredMessages
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .map(
      (message) =>
        ({
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
            emoji: reaction.emoji.name,
            imageURL: reaction.emoji.imageURL(),
          })),
        }) as MessageResponseType,
    )

  return shuffle ? shuffleArray(parsedMessages, RANDOM_SEED) : parsedMessages
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
function filterMessages(messages: Message[], filters: GetMessagesParamsType['filters']) {
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
