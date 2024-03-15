import { Client, Events, GatewayIntentBits } from 'discord.js'

import { Logger } from '@global/utils'

class DiscordClient {
  private client: Client
  private instance: DiscordClient | null = null
  private guildClient: Client | null = null

  private BOT_TOKEN = process.env.VITE_DISCORD_BOT_TOKEN

  constructor() {
    if (!this.BOT_TOKEN) {
      throw new Error('No bot token provided')
    }

    this.client = new Client({ intents: [GatewayIntentBits.Guilds] })
    this.client.login(this.BOT_TOKEN)
    this.client.once(Events.ClientReady, (readyClient) =>
      Logger.info(`Ready! Logged in as ${readyClient.user.tag}`),
    )
  }

  async getInstance() {
    if (!this.instance) {
      this.instance = new DiscordClient()
    }

    if (this.instance.guildClient) {
      return this.instance.guildClient
    }

    const GUILD_ID = process.env.VITE_DISCORD_GUILD_ID

    if (GUILD_ID) {
      Logger.info('Getting guild client')
      const guilds = await this.instance.client.guilds.fetch()
      const guild = guilds.get(GUILD_ID)

      if (!guild) {
        throw new Error(`Guild with id ${GUILD_ID} not found`)
      }

      Logger.info('Got guild client', guild.name)
      this.instance.guildClient = guild.client
      return guild.client
    }

    this.guildClient = this.instance.client
    return this.instance.client
  }
}

export default DiscordClient
