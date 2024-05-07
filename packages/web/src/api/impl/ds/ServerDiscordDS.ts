import axios, { type AxiosInstance } from 'axios'

import type {
  EmojiType,
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/src/discord'
import type { UserType } from '@global/types/src/user'
import type { ResponseType } from '@global/types/src/response'

import { Logger } from '@global/utils/src'

import DiscordDS from '@api/domain/ds/DiscordDS'

export default class ServerDS extends DiscordDS {
  private axiosInstance: AxiosInstance

  constructor() {
    super()
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_SERVER_API_URL,
    })
  }

  async loginWithCode(code: string): Promise<UserType> {
    console.log('loginWithCode', code)

    try {
      const response = await this.axiosInstance.post<ResponseType<UserType>>('/discord/login', {
        code,
      })

      if (response.data.status !== 200) {
        Logger.error('Error from server login with code', response.data.message)
        throw new Error(response.data.message)
      }

      return response.data.data
    } catch (error) {
      Logger.error('Error login with code', error)
      throw new Error('Error login with code')
    }

    return {
      id: '',
      email: '',
      password: '',
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
