import { Client, Events, GatewayIntentBits, Guild } from 'discord.js'

import { Logger } from '@global/utils'

class DiscordClient {
  private client?: Client
  private instance: DiscordClient | null = null
  private guildClient: Guild | null = null

  private BOT_TOKEN = process.env.VITE_DISCORD_BOT_TOKEN

  constructor() {
    if (!this.BOT_TOKEN && process.env.GITHUB_USER) {
      Logger.error('Skipping Discord login, missing BOT_TOKEN on GitHub Actions')
      return
    }

    this.client = new Client({ intents: [GatewayIntentBits.Guilds] })
    this.client.login(this.BOT_TOKEN)
    this.client.once(Events.ClientReady, (readyClient) => {
      Logger.info(`Ready! Logged in as ${readyClient.user.tag}`)
    })
  }

  async getInstance(guildId: string) {
    if (!this.instance) {
      this.instance = new DiscordClient()
    }

    if (!this.instance.client) {
      throw new Error('Discord client not initialized')
    }

    const guilds = this.instance.client.guilds.cache
    this.guildClient = guilds.get(guildId)!
    return this.guildClient
  }
}

export default new DiscordClient()
