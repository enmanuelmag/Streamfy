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
  BingoCreateParamsType,
  BingoExtendedType,
  BingoResponseType,
  BingoUserType,
} from '@global/types/dist/discord'

import { v4 as uuidv4 } from 'uuid'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { shuffle as shuffleArray } from 'shuffle-seed'

import { ErrorService, ErrorCodes } from '@global/utils'

import DiscordClient from '../../services/discord'

import * as Logger from 'firebase-functions/logger'

const db = getFirestore(initializeApp())

const RANDOM_SEED = Number(process.env.VITE_RANDOM_SEED) || 42

const USER_ACCESS_COLLECTION = 'user-access'

const BINGO_COLLECTION = 'bingo-v1'

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

export const createBingo = async (params: BingoCreateParamsType): Promise<BingoResponseType> => {
  Logger.info('Creating bingo', JSON.stringify(params))

  try {
    const bingoCollection = db.collection(BINGO_COLLECTION)

    const bingoExtended: BingoExtendedType = {
      id: uuidv4(),
      createdAt: new Date().valueOf(),
      combinations: createCombinationsBingo(params.sentences, params.layout),
      ...params,
    }

    await bingoCollection.doc(bingoExtended.id).set(bingoExtended)

    return {
      id: bingoExtended.id,
      title: bingoExtended.title,
      layout: bingoExtended.layout,
      createdAt: bingoExtended.createdAt,
      sentences: bingoExtended.sentences,
      description: bingoExtended.description,
      totalCombinations: bingoExtended.combinations.length,
    }
  } catch (error) {
    Logger.error('Error creating bingo', error)
    const { code, message } = ErrorCodes.ERROR_CREATING_BINGO_TABLE
    throw new ErrorService(code, message)
  }
}

export const getBingo = async (
  id: string,
  username: string,
  ip: string,
): Promise<BingoUserType> => {
  Logger.info('Getting bingo', id, username, ip)

  try {
    const bingoCollection = db.collection(BINGO_COLLECTION)

    const bingo = await bingoCollection.doc(id).get()

    if (!bingo.exists) {
      Logger.info(`Bingo with id ${id} not found`)
      const { code, message } = ErrorCodes.ERROR_REQUESTING_BINGO_TABLE
      throw new ErrorService(code, message)
    }

    Logger.info(`Bingo with id ${id} found`)

    const bingoData = bingo.data() as BingoExtendedType

    //first find if the user already has a bingo assigned
    const assignedBingo = bingoData.combinations.find((combination) => {
      const assignList = combination[Object.keys(combination)[0]].assignedTo
      return assignList.some((assignedIp) => assignedIp.includes(ip))
    })

    let combination: string

    const idUser = `${ip}=${username}`
    if (assignedBingo) {
      Logger.info('User already has a bingo assigned', idUser)
      combination = Object.keys(assignedBingo)[0]
    } else {
      Logger.info('User does not have a bingo assigned yet', idUser)
      //choose a random combination
      const randomIndex = Math.floor(Math.random() * bingoData.combinations.length)

      //assign the bingo to the user
      combination = Object.keys(bingoData.combinations[randomIndex])[0]

      bingoData.combinations[randomIndex][combination].assignedTo.push(idUser)
    }

    //get sentences from the combination
    const sentences = combination.split('-').map((index) => bingoData.sentences[Number(index)])

    const bingoUser: BingoUserType = {
      id: bingoData.id,
      title: bingoData.title,
      layout: bingoData.layout,
      sentences,
      description: bingoData.description,
    }

    //update the bingo with the new assigned user
    await bingoCollection.doc(id).set(bingoData)

    return bingoUser
  } catch (error) {
    Logger.error('Error getting bingo', error)
    const { code, message } = ErrorCodes.ERROR_REQUESTING_BINGO_TABLE
    throw new ErrorService(code, message)
  }
}

export const getBingoTables = async (discordUser: string): Promise<BingoResponseType[]> => {
  Logger.info('Getting bingo tables', discordUser)

  try {
    const bingoCollection = db.collection(BINGO_COLLECTION)

    const bingoTables = await bingoCollection
      .where('discordUser', '==', discordUser)
      .orderBy('createdAt', 'desc')
      .get()

    const tables = bingoTables.docs.map((doc) => {
      const data = doc.data() as BingoExtendedType

      return {
        id: data.id,
        title: data.title,
        layout: data.layout,
        createdAt: data.createdAt,
        sentences: data.sentences,
        description: data.description,
        totalCombinations: data.combinations.length,
      } as BingoResponseType
    })

    return tables
  } catch (error) {
    Logger.error('Error retrieving bingo tables', error)
    const { code, message } = ErrorCodes.ERROR_REQUESTING_BINGO_TABLE
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

function createCombinationsBingo(
  sentences: string[],
  layout: string,
): BingoExtendedType['combinations'] {
  Logger.info('Creating bingo combinations')
  // The parameter sentences is an array of strings with the sentences to use in each bingo cell
  // The parameter layout is a string with the layout of the bingo card, it can be '3' or '5'

  //Implement the logic to create the bingo card combinations based on the sentences and layout
  //Create all combinations needed to use all sentences in the bingo card
  //Create a array of strings with the combinations, where each string is a combination of numbers separated by '-'
  //Each number represents the index of the sentence in the sentences array

  const combinations: string[] = []

  const numbers = sentences.length

  //Create a array with all the numbers from 0 to the number of sentences
  const allNumbers = Array.from({ length: numbers }, (_, i) => i)

  console.log('All numbers', allNumbers)

  //Create a array with the layout numbers
  const layoutNumbers = Array.from({ length: Number(layout) }, (_, i) => i)

  console.log('Layout numbers', layoutNumbers)

  //Create a array with the rest of the numbers
  const restNumbers = allNumbers.filter((n) => !layoutNumbers.includes(n))

  console.log('Rest numbers', restNumbers)

  //Create a array with the layout numbers permutations
  const layoutPermutations = permutations(layoutNumbers)

  console.log('Layout permutations', layoutPermutations[0])

  //Create a array with the rest numbers permutations
  const restPermutations = permutations(restNumbers)

  console.log('Rest permutations', restPermutations[0])

  //Create the combinations
  for (const layoutPermutation of layoutPermutations) {
    for (const restPermutation of restPermutations) {
      combinations.push([...layoutPermutation, ...restPermutation].join('-'))
    }
  }

  Logger.info('Bingo combinations created', combinations.length)

  //Shuffle the combinations
  const shuffledCombinations = shuffleArray(combinations, RANDOM_SEED)

  //Return the combinations
  return shuffledCombinations.map((combination) => ({
    [combination]: {
      assignedTo: [],
    },
  }))
}

function permutations(numbers: number[]): number[][] {
  if (numbers.length === 1) return [numbers]

  const result: number[][] = []

  for (const number of numbers) {
    const rest = numbers.filter((n) => n !== number)

    const restPermutations = permutations(rest)

    for (const restPermutation of restPermutations) {
      result.push([number, ...restPermutation])
    }
  }

  return result
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
