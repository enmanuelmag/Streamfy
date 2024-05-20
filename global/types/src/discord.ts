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

export const DiscordGuildsSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  icon: zod.string().optional().nullable(),
  owner: zod.boolean(),
  features: zod.array(zod.string()),
})

export type DiscordGuildsType = zod.infer<typeof DiscordGuildsSchema>

export type UserAccessFirebaseType = {
  lastPayment: Timestamp
  dueDate: Timestamp
}

export const UserAccessSchema = zod.object({
  lastPayment: zod.number().optional().nullable(),
  dueDate: zod.number().optional().nullable(),
})

export type UserAccessType = zod.infer<typeof UserAccessSchema>

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
  access: UserAccessSchema,
})

export type UserDiscordType = zod.infer<typeof UserDiscordSchema>
