import axios, { type AxiosInstance } from 'axios'

import type {
  EmojiType,
  UserDiscordType,
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/src/discord'
import type { ResponseType } from '@global/types/src/response'

import { Logger } from '@global/utils/src'

import DiscordDS from '@api/domain/ds/DiscordDS'

const KEY_CREDENTIALS = 'credentials'

export default class ServerDS extends DiscordDS {
  private axiosInstance: AxiosInstance

  constructor() {
    super()
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_SERVER_API_URL,
    })
  }

  async loginWithCode(code: string): Promise<UserDiscordType> {
    try {
      const response = await this.axiosInstance.post<ResponseType<UserDiscordType>>(
        '/discord/login',
        {
          code,
        },
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server login with code', response.data.message)
        throw new Error(response.data.message)
      }

      localStorage.setItem(KEY_CREDENTIALS, JSON.stringify(response.data.data.credentials))

      return response.data.data
    } catch (error) {
      Logger.error('Error login with code', error)
      throw new Error('Error login with code')
    }
  }

  async getUser(): Promise<UserDiscordType> {
    const credentials = localStorage.getItem(KEY_CREDENTIALS)

    if (!credentials) {
      throw new Error('No credentials found')
    }

    try {
      const response = await this.axiosInstance.post<ResponseType<UserDiscordType>>(
        '/discord/user',
        JSON.parse(credentials),
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting user', response.data.message)
        throw new Error(response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error getting user', error)
      throw new Error('Error getting user')
    }
  }

  async getEmojis() {
    try {
      const response = await this.axiosInstance.get<ResponseType<EmojiType[]>>('/discord/emojis')

      if (response.data.status !== 200) {
        Logger.error('Error from server getting emojis', response.data.message)
        throw new Error(response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error getting emojis', error)
      throw new Error('Error getting emojis')
    }
  }

  async getMessages(params: GetMessagesParamsType): Promise<MessageResponseType[]> {
    try {
      const response = await this.axiosInstance.post<ResponseType<MessageResponseType[]>>(
        '/discord/messages',
        params,
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting messages', response.data.message)
        throw new Error(response.data.message)
      }
      return response.data.data
    } catch (error) {
      Logger.error('Error getting messages', error)
      throw new Error('Error getting messages')
    }
  }

  async getChannels(params: GetChannelsParamsType): Promise<ChannelResponseType[]> {
    try {
      const response = await this.axiosInstance.post<ResponseType<ChannelResponseType[]>>(
        '/discord/channels',
        params,
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting channels', response.data.message)
        throw new Error(response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error getting channels', error)
      throw new Error('Error getting channels')
    }
  }
}
