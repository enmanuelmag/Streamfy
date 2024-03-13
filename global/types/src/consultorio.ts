import zod from 'zod'

import { EmojiSchema } from './discord'

export const DiscordChannelSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
})

export type DiscordChannelType = zod.infer<typeof DiscordChannelSchema>

export const Step1Schema = zod.object({
  emoji: EmojiSchema.nullable().optional(),
  publicChannel: DiscordChannelSchema.nullable().optional(),
  privateChannel: DiscordChannelSchema.nullable().optional(),
})

export type Step1Type = zod.infer<typeof Step1Schema>
