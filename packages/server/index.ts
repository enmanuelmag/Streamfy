import { Client, Events, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config({ path: '../../env/.env' })

const BOT_TOKEN = process.env.VITE_DISCORD_BOT_TOKEN

if (!BOT_TOKEN) {
  throw new Error('No bot token provided')
}

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

// Log in to Discord with your client's token
client.login(BOT_TOKEN)
