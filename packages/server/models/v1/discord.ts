import type { TextChannel } from 'discord.js'
import type {
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/dist/discord'

import DiscordClient from '../../services/discord'

import { Logger } from '@global/utils'

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

  Logger.info('Got messages', messages.size)

  return messages
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
