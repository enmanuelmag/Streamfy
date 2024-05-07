import type {
  EmojiType,
  ChannelResponseType,
  MessageResponseType,
  GetChannelsParamsType,
  GetMessagesParamsType,
} from '@global/types/src/discord'
import type { UserType } from '@global/types/src/user'

export default abstract class DiscordDS {
  abstract getEmojis(): Promise<EmojiType[]>

  abstract getMessages(params: GetMessagesParamsType): Promise<MessageResponseType[] | null>

  abstract getChannels(params: GetChannelsParamsType): Promise<ChannelResponseType[] | null>

  abstract loginWithCode(code: string): Promise<UserType>
}
