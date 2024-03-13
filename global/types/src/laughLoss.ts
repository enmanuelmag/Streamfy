import zod from 'zod'

import { EmojiSchema } from './discord'

export const Step1Schema = zod.object({
  emoji: EmojiSchema.nullable().optional(),
  discordChannel: zod.object({
    id: zod.string().min(1, 'Seleccione un canal de discord'),
    name: zod.string().min(1, 'Seleccione un canal de discord'),
  }),
})

export type Step1Type = zod.infer<typeof Step1Schema>
