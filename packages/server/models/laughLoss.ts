import type { TextChannel } from 'discord.js'

import DiscordClient from '../services/discord'

import { GetMessagesParamsType } from 'types/laughLoss'
import { Logger } from '../../utils/log'

const Discord = DiscordClient.getInstance()

// Public methods
export const getMessages = async (params: GetMessagesParamsType) => {
  Logger.info('Getting messages', params)

  const { channelId, limit, before, after, around } = params
  const channel = Discord.channels.cache.get(channelId) as TextChannel

  if (!channel) {
    Logger.error('Channel not found', channelId)
    throw new Error('Channel not found')
  }

  const messages = await channel.messages.fetch({ limit, before, after, around })

  Logger.info(
    'Got messages',
    messages.forEach((message) => message.content),
  )

  return messages.map((message) => {
    return {
      id: message.id,
      author: message.author.username,
      content: message.content,
    }
  })
}

export const getChannels = async () => {
  Logger.info('Getting channels')

  const channels = Discord.channels.cache

  Logger.info('Got channels', channels)

  return channels
}
// Internal methods
