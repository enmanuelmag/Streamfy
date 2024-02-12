import axios, { type AxiosInstance } from 'axios'

import type {
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/src/discord'
import type { ResponseType } from '@global/types/src/response'

import { Logger } from '@global/utils/src/log'

import DiscordDS from '@api/domain/ds/DiscordDS'

export default class ServerDS extends DiscordDS {
  private axiosInstance: AxiosInstance

  constructor() {
    super()
    this.axiosInstance = axios.create({
      baseURL: import.meta.env.VITE_SERVER_API_URL,
    })
  }
  async getMessages(params: GetMessagesParamsType): Promise<MessageResponseType[]> {
    try {
      const response = await this.axiosInstance.post<ResponseType<MessageResponseType[]>>(
        '/messages',
        params,
      )

      if (response.data.status !== 200) {
        Logger.error('Error from server getting messages', response.data.message)
        throw new Error(response.data.message)
      }
      Logger.info('Got messages', response.data.data[0].attachments[0])
      return response.data.data
    } catch (error) {
      Logger.error('Error getting messages', error)
      throw new Error('Error getting messages')
    }
  }
  async getChannels(params: GetChannelsParamsType): Promise<ChannelResponseType[]> {
    try {
      const response = await this.axiosInstance.post<ResponseType<ChannelResponseType[]>>(
        '/channels',
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
