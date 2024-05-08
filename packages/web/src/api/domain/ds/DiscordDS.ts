import type {
  EmojiType,
  UserDiscordType,
  ChannelResponseType,
  MessageResponseType,
  GetChannelsParamsType,
  GetMessagesParamsType,
  GetEmojisParamsType,
} from '@global/types/src/discord'

export default abstract class DiscordDS {
  abstract getEmojis(params: GetEmojisParamsType): Promise<EmojiType[]>

  abstract getMessages(params: GetMessagesParamsType): Promise<MessageResponseType[] | null>

  abstract getChannels(params: GetChannelsParamsType): Promise<ChannelResponseType[] | null>

  abstract loginWithCode(code: string): Promise<UserDiscordType>

  abstract getUser(): Promise<UserDiscordType>
}
