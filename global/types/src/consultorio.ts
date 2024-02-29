import zod from 'zod'

export const DiscordChannelSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
})

export type DiscordChannelType = zod.infer<typeof DiscordChannelSchema>

export const Step1Schema = zod.object({
  discordChannels: zod.array(DiscordChannelSchema).min(1, 'Selecciona al menos un canal'),
})

export type Step1Type = zod.infer<typeof Step1Schema>
