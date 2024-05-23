import {
  BingoCreateParamsType,
  GetChannelsParamsType,
  GetEmojisParamsType,
  GetMessagesParamsType,
} from '@global/types/src/discord'

import DiscordDS from '@api/domain/ds/DiscordDS'
import DiscordRepo from '@api/domain/repo/DiscordRepo'

export default class DiscordRepoImpl extends DiscordRepo {
  private ds: DiscordDS

  constructor(ds: DiscordDS) {
    super()
    this.ds = ds
  }
  getEmojis(params: GetEmojisParamsType) {
    return this.ds.getEmojis(params)
  }

  getMessages(params: GetMessagesParamsType) {
    return this.ds.getMessages(params)
  }

  getChannels(params: GetChannelsParamsType) {
    return this.ds.getChannels(params)
  }

  loginWithCode(code: string) {
    return this.ds.loginWithCode(code)
  }

  getUser() {
    return this.ds.getUser()
  }

  createBingo(data: BingoCreateParamsType) {
    return this.ds.createBingo(data)
  }

  getBingoTables(discordUser: string) {
    return this.ds.getBingoTables(discordUser)
  }

  getBingo(bingoId: string, userName: string) {
    return this.ds.getBingo(bingoId, userName)
  }
}
