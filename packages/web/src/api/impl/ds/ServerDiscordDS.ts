import axios from 'axios'

import type {
  EmojiType,
  UserDiscordType,
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
  GetEmojisParamsType,
  BingoCreateParamsType,
  BingoResponseType,
  BingoUserType,
} from '@global/types/src/discord'
import type { ResponseType } from '@global/types/src/response'

import { ErrorCodes, ErrorService, Logger } from '@global/utils/src'

import DiscordDS from '@api/domain/ds/DiscordDS'

const KEY_CREDENTIALS = 'credentials'

const REPLACE_TOKEN = '{{functions}}'

export default class ServerDS extends DiscordDS {
  //private axiosInstance: AxiosInstance

  constructor() {
    super()
    // this.axiosInstance = axios.create({
    //   baseURL: import.meta.env.VITE_SERVER_API_URL,
    // })
  }

  getURL(endpoint: string) {
    const url: string = import.meta.env.VITE_SERVER_API_CLOUD || ''

    return url.replace(REPLACE_TOKEN, endpoint)
  }

  async loginWithCode(code: string): Promise<UserDiscordType> {
    try {
      const response = await axios.post<ResponseType<UserDiscordType>>(this.getURL('login'), {
        code,
        isDev: import.meta.env.DEV,
      })

      if (response.data.status !== 200) {
        Logger.error('Error from server login with code', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }

      localStorage.setItem(KEY_CREDENTIALS, JSON.stringify(response.data.data.credentials))

      return response.data.data
    } catch (error) {
      Logger.error('Error login with code', error)
      throw error
    }
  }

  async getUser(): Promise<UserDiscordType> {
    const credentials = localStorage.getItem(KEY_CREDENTIALS)

    if (!credentials) {
      const { code, message } = ErrorCodes.ERROR_CREDENTIALS_LOCAL_STORAGE
      throw new ErrorService(code, message)
    }

    try {
      const parsedCredentials = JSON.parse(credentials)

      const response = await axios.post<ResponseType<UserDiscordType>>(
        this.getURL('user'),
        parsedCredentials,
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting user', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }

      const user = response.data.data

      user.credentials = parsedCredentials

      return response.data.data
    } catch (error) {
      Logger.error('Error getting user', error)
      throw error
    }
  }

  async getEmojis(params: GetEmojisParamsType) {
    try {
      const response = await axios.post<ResponseType<EmojiType[]>>(this.getURL('emojis'), params)

      if (response.data.status !== 200) {
        Logger.error('Error from server getting emojis', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error getting emojis', error)
      throw error
    }
  }

  async getMessages(params: GetMessagesParamsType): Promise<MessageResponseType[]> {
    try {
      const response = await axios.post<ResponseType<MessageResponseType[]>>(
        this.getURL('messages'),
        params,
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting messages', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }
      return response.data.data
    } catch (error) {
      Logger.error('Error getting messages', error)
      throw error
    }
  }

  async getChannels(params: GetChannelsParamsType): Promise<ChannelResponseType[]> {
    try {
      const response = await axios.post<ResponseType<ChannelResponseType[]>>(
        this.getURL('channels'),
        params,
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting channels', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error getting channels', error)
      throw error
    }
  }

  async createBingo(data: BingoCreateParamsType) {
    try {
      const response = await axios.post<ResponseType<BingoResponseType>>(
        this.getURL('bingoCreate'),
        data,
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server creating bingo', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }

      Logger.info('Bingo created', response.data.data)

      return response.data.data
    } catch (error) {
      Logger.error('Error creating bingo', error)
      throw error
    }
  }

  async getBingoTables(discordUser: string): Promise<BingoResponseType[]> {
    try {
      const response = await axios.post<ResponseType<BingoResponseType[]>>(
        this.getURL('bingoTables'),
        { discordUser },
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting bingo tables', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error getting bingo tables', error)
      throw error
    }
  }

  async getBingo(bingoId: string, userName: string): Promise<BingoUserType> {
    try {
      const response = await axios.post<ResponseType<BingoUserType>>(this.getURL('bingoPlay'), {
        bingoId,
        userName,
      })

      if (response.data.status !== 200) {
        Logger.error('Error from server getting bingo', response.data.message)
        throw new ErrorService(response.data.code, response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error getting bingo', error)
      throw error
    }
  }
}
