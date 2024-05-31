import zod from 'zod'
import { ChannelType } from 'discord.js'
import type { Timestamp } from 'firebase/firestore'

export const BasicParamsSchema = zod.object({
  guildId: zod.string(),
})

export type BasicParamsType = zod.infer<typeof BasicParamsSchema>

export const EmojiSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  imageURL: zod.string().optional().nullable(),
})

export type EmojiType = zod.infer<typeof EmojiSchema>

export const AttachmentSchema = zod.object({
  id: zod.string(),
  url: zod.string(),
  size: zod.number(),
  attachment: zod.string(),
  width: zod.number().nullable(),
  height: zod.number().nullable(),
  description: zod.string().nullable(),
  contentType: zod.string().nullable(),
})

export type AttachmentType = zod.infer<typeof AttachmentSchema>

export const GetEmojisParamsSchema = zod.object({}).merge(BasicParamsSchema)

export type GetEmojisParamsType = zod.infer<typeof GetEmojisParamsSchema>

export const MessageFiltersSchema = zod.object({
  authorId: zod.string().optional().nullable(),
  emojiName: zod.string().optional().nullable(),
  hasAttachments: zod.boolean().optional().nullable(),
})

export type MessageFiltersType = zod.infer<typeof MessageFiltersSchema>

export const GetMessagesParamsSchema = zod
  .object({
    shuffle: zod.boolean().optional(),
    channels: zod.array(
      zod.object({
        id: zod.string(),
        limit: zod.number().optional(),
        before: zod.string().optional(),
        after: zod.string().optional(),
        around: zod.string().optional(),
        filters: MessageFiltersSchema.optional(),
      }),
    ),
  })
  .merge(BasicParamsSchema)

export type GetMessagesParamsType = zod.infer<typeof GetMessagesParamsSchema>

export const MessageResponseSchema = zod.object({
  id: zod.string(),
  content: zod.string(),
  timestamp: zod.number(),
  reactions: zod.array(EmojiSchema.extend({ count: zod.number() })),
  attachments: zod.array(AttachmentSchema),
  author: zod.object({
    id: zod.string(),
    username: zod.string(),
    globalName: zod.string().optional().nullable(),
    discriminator: zod.string(),
    accentColor: zod.number().optional().nullable(),
    avatar: zod.string().optional().nullable(),
  }),
})

export type MessageResponseType = zod.infer<typeof MessageResponseSchema>

// Get Channels
export const ChannelTypeSchema = zod.number().min(0).max(16)

export type ChannelTypeType = ChannelType

export const GetChannelsParamsSchema = zod
  .object({
    channelType: ChannelTypeSchema,
  })
  .merge(BasicParamsSchema)

export type GetChannelsParamsType = zod.infer<typeof GetChannelsParamsSchema>

export const ChannelResponseSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  type: zod.number(),
  url: zod.string(),
})

export type ChannelResponseType = zod.infer<typeof ChannelResponseSchema>

export const DiscordTokenSchema = zod.object({
  tokenType: zod.string(),
  accessToken: zod.string(),
  expiresIn: zod.number(),
  refreshToken: zod.string(),
  scope: zod.string(),
})

export type DiscordTokenType = zod.infer<typeof DiscordTokenSchema>

// Discord Guilds
export const DiscordGuildsSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  icon: zod.string().optional().nullable(),
  owner: zod.boolean(),
  features: zod.array(zod.string()),
})

export type DiscordGuildsType = zod.infer<typeof DiscordGuildsSchema>

// Access Firebase
export type UserAccessFirebaseType = {
  lastPayment: Timestamp
  dueDate: Timestamp
}

export const UserAccessSchema = zod.object({
  lastPayment: zod.number().optional().nullable(),
  dueDate: zod.number().optional().nullable(),
})

export type UserAccessType = zod.infer<typeof UserAccessSchema>

// User Discord
export const UserDiscordSchema = zod.object({
  id: zod.string(),
  username: zod.string(),
  email: zod.string().optional().nullable(),
  guilds: zod.array(DiscordGuildsSchema),
  avatar: zod.string().optional().nullable(),
  credentials: zod
    .object({
      accessToken: zod.string(),
      refreshToken: zod.string(),
      tokenType: zod.string(),
      expiresIn: zod.number(),
      scope: zod.string(),
    })
    .optional()
    .nullable(),
  streamfyToken: zod.string().optional().nullable(),
  access: UserAccessSchema,
})

export type UserDiscordType = zod.infer<typeof UserDiscordSchema>

// Bingo
export const BingoSchema = zod.object({
  id: zod.string(), //id will be public or receive from the client but hashed
  // one fetch to request a table, the the IP is save and assigned to a table combination, the return the table data with the id same as the IP hash
  title: zod.string().min(1).max(100),
  description: zod.string().min(1).max(1000).nullable().optional(),
  sentences: zod.array(zod.string()).min(9),
  layout: zod.enum(['3', '4', '5', '6']),
})

export type BingoType = zod.infer<typeof BingoSchema>

export const BingoExtendedSchema = BingoSchema.extend({
  createdAt: zod.number(),
  discordUser: UserDiscordSchema.shape.username,
  combinations: zod
    .array(
      zod.record(
        zod.string(), //combinations (number from 1 to 9 separated by -) example: 1-2-3-4-5-6-7-8-9, 7-8-9-4-5-6-3-2-1
        zod.object({
          assignedTo: zod.array(zod.string()),
        }),
      ),
    )
    .min(9),
})

export type BingoExtendedType = zod.infer<typeof BingoExtendedSchema>

export const BingoCreateParamsType = BingoSchema.omit({ id: true }).extend({
  discordUser: UserDiscordSchema.shape.username,
})

export type BingoCreateParamsType = zod.infer<typeof BingoCreateParamsType>

export const BingoResponseSchema = BingoSchema.pick({
  description: true,
  layout: true,
  id: true,
  title: true,
  sentences: true,
}).extend({
  createdAt: zod.number(),
  totalCombinations: zod.number(),
})

export type BingoResponseType = zod.infer<typeof BingoResponseSchema>

export const BingoUserSchema = BingoSchema

export type BingoUserType = zod.infer<typeof BingoUserSchema>

// Bingo Unique
export const PredictionBingoSchema = zod.object({
  title: zod.string().min(5, 'Debe tener al menos 5 caracteres'),
  description: zod.string().optional().nullable(),
  image: zod.string().optional().nullable(),
  marked: zod.boolean().optional().nullable(),
  condition: zod
    .object({
      targetCounter: zod
        .object({
          target: zod.number(),
          counter: zod.number(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
})

export type PredictionBingoType = zod.infer<typeof PredictionBingoSchema>

export const BingoUniqueSchema = zod.object({
  id: zod.string(),
  title: zod
    .string()
    .min(1, 'Debe tener al menos 1 caracter')
    .max(100, 'No puede tener más de 100 caracteres'),
  description: zod
    .string()
    .min(1, 'Debe tener al menos 1 caracter')
    .max(1000, 'No puede tener más de 1000 caracteres')
    .optional()
    .nullable(),
  predictions: zod.array(PredictionBingoSchema), //.length(25, 'Deben ser 25 predicciones'),
})

export type BingoUniqueType = zod.infer<typeof BingoUniqueSchema>

export const BingoUniqueExtendedSchema = BingoUniqueSchema.extend({
  createdAt: zod.number(),
  discordUser: UserDiscordSchema.shape.username,
})

export type BingoUniqueExtendedType = zod.infer<typeof BingoUniqueExtendedSchema>

export const BingoUniqueCreateParamsType = BingoUniqueSchema.omit({ id: true }).extend({
  discordUser: UserDiscordSchema.shape.username,
})

export type BingoUniqueCreateParamsType = zod.infer<typeof BingoUniqueCreateParamsType>

export const BingoUniqueResponseSchema = BingoUniqueSchema.pick({
  id: true,
  title: true,
  description: true,
}).extend({
  createdAt: zod.number(),
})

export type BingoUniqueResponseType = zod.infer<typeof BingoUniqueResponseSchema>
