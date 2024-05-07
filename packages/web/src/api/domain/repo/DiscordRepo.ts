import type {
  EmojiType,
  ChannelResponseType,
  GetChannelsParamsType,
  MessageResponseType,
  GetMessagesParamsType,
} from '@global/types/src/discord'
import { UserType } from '@global/types/src/user'

export default abstract class DiscordRepo {
  abstract getEmojis(): Promise<EmojiType[]>

  abstract getMessages(params: GetMessagesParamsType): Promise<MessageResponseType[] | null>

  abstract getChannels(params: GetChannelsParamsType): Promise<ChannelResponseType[] | null>

  abstract loginWithCode(code: string): Promise<UserType>
}
