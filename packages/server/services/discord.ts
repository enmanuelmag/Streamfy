import { Client, Events, GatewayIntentBits } from 'discord.js'

import { Logger } from '../../utils/log'

class DiscordClient {
  #client: Client
  private static instance: DiscordClient

  private constructor() {
    const BOT_TOKEN = process.env.VITE_DISCORD_BOT_TOKEN

    if (!BOT_TOKEN) {
      throw new Error('No bot token provided')
    }
    this.#client = new Client({ intents: [GatewayIntentBits.Guilds] })
    this.#client.login(process.env.DISCORD_TOKEN)
    this.#client.once(Events.ClientReady, (readyClient) =>
      Logger.info(`Ready! Logged in as ${readyClient.user.tag}`),
    )
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new DiscordClient()
    }
    return this.instance.#client
  }
}

export default DiscordClient
