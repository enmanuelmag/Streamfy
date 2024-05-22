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
  GetEmojisParamsType,
  UserAccessType,
  UserAccessFirebaseType,
} from '@global/types/dist/discord'

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { shuffle as shuffleArray } from 'shuffle-seed'

import { ErrorService, ErrorCodes } from '@global/utils'

import DiscordClient from '../../services/discord'

import * as Logger from 'firebase-functions/logger'

const db = getFirestore(initializeApp())

const RANDOM_SEED = Number(process.env.VITE_RANDOM_SEED) || 42

const USER_ACCESS_COLLECTION = 'user-access'

const CONTACT_EMAIL = 'enmanuelmag@cardor.dev'

// Public methods to controllers
export const getUser = async ({
  accessToken,
  tokenType,
}: {
  accessToken: string
  tokenType: string
}): Promise<UserDiscordType> => {
  Logger.info('Getting user', accessToken.length, tokenType.length)

  let responseUser: Response
  try {
    responseUser = await fetch(`${process.env.VITE_DISCORD_API_URL}/users/@me`, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })
  } catch (error) {
    Logger.error('Error getting user', error)
    const { code, message } = ErrorCodes.ERROR_GETTING_USER
    throw new ErrorService(code, message)
  }

  let responseGuilds: Response
  try {
    responseGuilds = await fetch(`${process.env.VITE_DISCORD_API_URL}/users/@me/guilds`, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })
    Logger.info('Got guilds', responseGuilds.status)
  } catch (error) {
    Logger.error('Error getting guilds', error)
    const { code, message } = ErrorCodes.ERROR_GETTING_GUILDS
    throw new ErrorService(code, message)
  }

  let allGuilds: DiscordGuildsType[] = []
  let ownerGuilds: DiscordGuildsType[] = []
  let discordUser: User & { email: string; global_name: string }
  try {
    allGuilds = await responseGuilds.json()

    ownerGuilds = allGuilds.filter((guild) => guild.owner)

    discordUser = await responseUser.json()
  } catch (error) {
    Logger.error('Error mapping user data', error)
    const { code, message } = ErrorCodes.ERROR_MAPPING_USER_DATA
    throw new ErrorService(code, message)
  }

  const access = await getUserAccess(discordUser.username)

  return {
    access,
    id: discordUser.id,
    email: discordUser.email,
    username: discordUser.global_name || discordUser.username,
    guilds: ownerGuilds,
    avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
    credentials: {
      accessToken,
      refreshToken: '',
      tokenType,
      expiresIn: 0,
      scope: '',
    },
  } as UserDiscordType
}

export const loginWithCode = async (code: string, isDev?: boolean): Promise<UserDiscordType> => {
  Logger.info('Logging in with code', code.length, isDev)

  const data = {
    code,
    grant_type: 'authorization_code',
    redirect_uri: !isDev
      ? process.env.VITE_DISCORD_REDIRECT_URI
      : 'http://localhost:3500/loginCallback',
    client_id: process.env.VITE_DISCORD_CLIENT_ID,
    client_secret: process.env.VITE_DISCORD_CLIENT_SECRET,
  }

  const encodedData = encodeParams(data)

  Logger.info('Getting discord credentials with', encodedData)

  let responseToken: Response
  try {
    responseToken = await fetch(`${process.env.VITE_DISCORD_API_URL}/oauth2/token`, {
      method: 'POST',
      body: encodedData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    Logger.info('Got discord credentials', responseToken.status)
  } catch (error) {
    Logger.error('Error getting discord credentials', error)
    const { code, message } = ErrorCodes.ERROR_GET_DISCORD_CREDS
    throw new ErrorService(code, message)
  }

  const rawCredentials = await responseToken.json()

  const credentials: DiscordTokenType = {
    accessToken: rawCredentials.access_token,
    refreshToken: rawCredentials.refresh_token,
    tokenType: rawCredentials.token_type,
    expiresIn: rawCredentials.expires_in,
    scope: rawCredentials.scope,
  }

  const discordUser = await getUser({
    accessToken: credentials.accessToken,
    tokenType: credentials.tokenType,
  })

  return {
    ...discordUser,
    credentials,
  } as UserDiscordType
}

export const getEmojis = async (params: GetEmojisParamsType): Promise<EmojiType[]> => {
  const Discord = await DiscordClient.getInstance(params.guildId)

  Logger.info('Getting emojis')

  try {
    const fetchEmojis = await Discord.emojis.fetch()

    const emojis = fetchEmojis.toJSON()

    Logger.info('Got emojis', emojis.length)

    return emojis.map((e) => ({
      id: e.id,
      imageURL: e.imageURL(),
      name: e.name || e.id,
    }))
  } catch (error) {
    Logger.error('Error getting emojis', error)
    const { code, message } = ErrorCodes.ERROR_GETTING_EMOJIS
    throw new ErrorService(code, message)
  }
}

export const getMessages = async (
  params: GetMessagesParamsType,
): Promise<MessageResponseType[]> => {
  const Discord = await DiscordClient.getInstance(params.guildId)

  Logger.info('Getting messages', JSON.stringify(params))

  const { channels, shuffle } = params

  let messages: Message[] = []

  try {
    for (const item of channels) {
      const { id, after, around, before, filters, limit } = item

      const channel = (await Discord.channels.fetch(id)) as TextChannel

      const fetchedMessages = await channel.messages.fetch({ limit, before, after, around })

      const filteredMessages = filterMessages(fetchedMessages.toJSON(), filters)

      messages.push(...filteredMessages)
    }
  } catch (error) {
    Logger.error('Error getting messages', error)
    const { code, message } = ErrorCodes.ERROR_GETTING_MESSAGES
    throw new ErrorService(code, message)
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
  const Discord = await DiscordClient.getInstance(params.guildId)

  Logger.info('Getting channels', JSON.stringify(params))

  try {
    const fetchChannels = await Discord.channels.fetch()

    const channels = fetchChannels
      .filter((channel) => channel?.type === params.channelType)
      .toJSON() as TextChannel[]

    Logger.info('Got channels', channels.length)

    return channels.map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
      url: channel.url,
    }))
  } catch (error) {
    Logger.error('Error getting channels', error)
    const { code, message } = ErrorCodes.ERROR_GETTING_CHANNELS
    throw new ErrorService(code, message)
  }
}

/*
  Internal methods
*/
async function getUserAccess(username: string): Promise<UserAccessType> {
  try {
    Logger.info('Getting user access')
    const userAccess = await db.collection(USER_ACCESS_COLLECTION).doc(username).get()

    if (!userAccess.exists) {
      Logger.info(`Username ${username} has no access yet`)
      throw new Error(`El ${username} no tiene acceso, por favor contactar a ${CONTACT_EMAIL}`)
    }

    Logger.info(`Username ${username} has access`)

    const firebaseData = userAccess.data() as UserAccessFirebaseType

    const data: UserAccessType = {
      dueDate: firebaseData.dueDate.toDate().valueOf(),
      lastPayment: firebaseData.lastPayment.toDate().valueOf(),
    }

    return data
  } catch (error) {
    Logger.error('Error getting user access', error)
    const { code, message } = ErrorCodes.ERROR_GETTING_ACCESS
    throw new ErrorService(code, message)
  }
}

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
