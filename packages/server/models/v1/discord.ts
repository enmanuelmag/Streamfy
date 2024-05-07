import type { TextChannel, Message, User } from 'discord.js'
import type {
  EmojiType,
  UserDiscordType,
  DiscordTokenType,
  DiscordGuildsType,
  ChannelResponseType,
  GetChannelsParamsType,
  MessageFiltersType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/dist/discord'

import shuffleArray from 'knuth-shuffle-seeded'

import DiscordClient from '../../services/discord'

import { Logger } from '@global/utils'

const RANDOM_SEED = Number(process.env.VITE_RANDOM_SEED) || 7

// Public methods
export const getUser = async ({
  accessToken,
  tokenType,
}: {
  accessToken: string
  tokenType: string
}): Promise<UserDiscordType> => {
  Logger.info('Getting user')

  const responseUser = await fetch(`${process.env.VITE_DISCORD_API_URL}/users/@me`, {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
    },
  })

  const responseGuilds = await fetch(`${process.env.VITE_DISCORD_API_URL}/users/@me/guilds`, {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
    },
  })

  const allGuilds = (await responseGuilds.json()) as DiscordGuildsType[]

  const ownerGuilds = allGuilds.filter((guild) => guild.owner)

  const discordUser = (await responseUser.json()) as User & { email: string }

  return {
    id: discordUser.id,
    email: discordUser.email,
    username: discordUser.username,
    guilds: ownerGuilds,
    credentials: {
      accessToken,
      refreshToken: '',
      tokenType,
      expiresIn: 0,
      scope: '',
    },
  } as UserDiscordType
}

export const loginWithCode = async (code: string): Promise<UserDiscordType> => {
  Logger.info('Logging in with code', code)

  const data = {
    code,
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:3500/loginCallback',
    client_id: process.env.VITE_DISCORD_CLIENT_ID,
    client_secret: process.env.VITE_DISCORD_CLIENT_SECRET,
  }

  const encodedData = encodeParams(data)

  const responseToken = await fetch(`${process.env.VITE_DISCORD_API_URL}/oauth2/token`, {
    method: 'POST',
    body: encodedData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const rawCredentials = await responseToken.json()

  const credentials: DiscordTokenType = {
    accessToken: rawCredentials.access_token,
    refreshToken: rawCredentials.refresh_token,
    tokenType: rawCredentials.token_type,
    expiresIn: rawCredentials.expires_in,
    scope: rawCredentials.scope,
  }

  Logger.info('Credentials received', credentials)

  const discordUser = await getUser({
    accessToken: credentials.accessToken,
    tokenType: credentials.tokenType,
  })

  return {
    id: discordUser.id,
    email: discordUser.email,
    username: discordUser.username,
    guilds: discordUser.guilds,
    credentials,
  } as UserDiscordType
}

export const getEmojis = async (): Promise<EmojiType[]> => {
  const Discord = await DiscordClient.getInstance()

  Logger.info('Getting emojis')

  const emojis = Discord.emojis.cache.toJSON()

  Logger.info('Got emojis', emojis.length)

  return emojis.map((e) => ({
    id: e.id,
    imageURL: e.imageURL(),
    name: e.name || e.id,
  }))
}

export const getMessages = async (
  params: GetMessagesParamsType,
): Promise<MessageResponseType[]> => {
  const Discord = await DiscordClient.getInstance()

  Logger.info('Getting messages', JSON.stringify(params))

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
  const Discord = await DiscordClient.getInstance()

  Logger.info('Getting channels', JSON.stringify(params))

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
function encodeParams(obj: Record<string, unknown>) {
  let string = ''

  for (const [key, value] of Object.entries(obj)) {
    if (!value) continue
    string += `&${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
  }

  return string.substring(1)
}

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
