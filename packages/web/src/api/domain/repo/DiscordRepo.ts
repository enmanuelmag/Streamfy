import type {
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/src/discord'

export default abstract class DiscordRepo {
  abstract getMessages(params: GetMessagesParamsType): Promise<MessageResponseType[] | null>

  abstract getChannels(params: GetChannelsParamsType): Promise<ChannelResponseType[] | null>
}
