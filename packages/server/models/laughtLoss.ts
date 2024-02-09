import type { TextChannel } from 'discord.js'

import DiscordClient from '../services/discord'

import { GetMessagesParamsType } from 'types/laughLoss'
import { Logger } from '../../utils/log'

export const Discord = DiscordClient.getInstance()

export const getMessages = async (params: GetMessagesParamsType) => {
  Logger.info('Getting messages', params)

  const { channelId, limit, before, after, around } = params
  const channel = Discord.channels.cache.get(channelId) as TextChannel

  if (!channel) {
    Logger.error('Channel not found', channelId)
    throw new Error('Channel not found')
  }

  const messages = await channel.messages.fetch({ limit, before, after, around })

  Logger.info('Got messages', messages)

  return messages
}
