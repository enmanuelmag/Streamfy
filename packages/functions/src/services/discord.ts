import { Client, Events, GatewayIntentBits, Guild } from 'discord.js'

import { Logger } from '@global/utils'

class DiscordClient {
  private client: Client
  private instance: DiscordClient | null = null
  private guildClient: Guild | null = null

  private BOT_TOKEN = process.env.VITE_DISCORD_BOT_TOKEN

  constructor() {
    if (!this.BOT_TOKEN && process.env.GITHUB_USER) {
      throw new Error('No bot token found')
    }

    this.client = new Client({ intents: [GatewayIntentBits.Guilds] })
    this.client.login(this.BOT_TOKEN)
    this.client.once(Events.ClientReady, (readyClient) => {
      Logger.info(`Ready! Logged in as ${readyClient.user.tag}`)
    })
  }

  async getInstance(guildId: string) {
    return new Promise<Guild>((resolve, reject) => {
      try {
        if (!this.instance) {
          Logger.info('Creating new instance')
          this.instance = new DiscordClient()
        }

        Logger.info('Getting guild client')

        const guilds = this.instance.client.guilds.cache
        this.guildClient = guilds.get(guildId)!

        Logger.info('Guild client result', this.guildClient)

        resolve(this.guildClient)
      } catch (error) {
        Logger.error('Error getting guild client', error)
        reject(error)
      }
    })
  }
}

export default new DiscordClient()
