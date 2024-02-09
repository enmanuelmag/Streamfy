import type { TextChannel } from 'discord.js'

import {
  GetChannelsParamsType,
  GetMessagesParamsType,
  MessageResponseType,
} from '@global/types/laughLoss'

import DiscordClient from '../services/discord'

import { Logger } from '@global/utils/log'

const Discord = DiscordClient.getInstance()

// Public methods
export const getMessages = async (
  params: GetMessagesParamsType,
): Promise<MessageResponseType[]> => {
  Logger.info('Getting messages', params)

  const { channelId, limit, before, after, around, regex } = params
  const channel = Discord.channels.cache.get(channelId) as TextChannel

  if (!channel) {
    Logger.error('Channel not found', channelId)
    throw new Error('Channel not found')
  }

  let messages = await channel.messages.fetch({ limit, before, after, around })

  if (regex) {
    const regexPattern = new RegExp(regex)
    messages = messages.filter((message) => regexPattern.test(message.content))
  }

  Logger.info(
    'Got messages',
    messages.forEach((message) => message.content),
  )

  return messages.map((message) => ({
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
    attachments: message.attachments.toJSON(),
  }))
}

export const getChannels = async (params: GetChannelsParamsType) => {
  Logger.info('Getting channels')

  const channels = Discord.channels.cache.filter((channel) => channel.type === params.channelType)

  Logger.info('Got channels', channels.size)

  return channels
}

// Internal methods
