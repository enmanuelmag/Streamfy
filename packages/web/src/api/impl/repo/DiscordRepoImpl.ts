import { GetChannelsParamsType, GetMessagesParamsType } from '@global/types/src/discord'

import type { UserType } from '@global/types/src/user'

import DiscordDS from '@api/domain/ds/DiscordDS'
import DiscordRepo from '@api/domain/repo/DiscordRepo'

export default class DiscordRepoImpl extends DiscordRepo {
  private ds: DiscordDS

  constructor(ds: DiscordDS) {
    super()
    this.ds = ds
  }

  getEmojis() {
    return this.ds.getEmojis()
  }

  getMessages(params: GetMessagesParamsType) {
    return this.ds.getMessages(params)
  }

  getChannels(params: GetChannelsParamsType) {
    return this.ds.getChannels(params)
  }

  loginWithCode(code: string): Promise<UserType> {
    return this.ds.loginWithCode(code)
  }
}
