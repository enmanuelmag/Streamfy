import zod from 'zod'
import { ChannelType } from 'discord.js'

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

// Get Messages
export const GetMessagesParamsSchema = zod.object({
  channelIds: zod.array(zod.string()),
  limit: zod.number().optional(),
  before: zod.string().optional(),
  after: zod.string().optional(),
  around: zod.string().optional(),
  regex: zod.string().optional(),
  shuffle: zod.boolean().optional(),
  filters: zod
    .object({
      authorId: zod.string().optional().nullable(),
      emojiName: zod.string().optional().nullable(),
      hasAttachments: zod.boolean().optional().nullable(),
    })
    .optional(),
})

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

export const GetChannelsParamsSchema = zod.object({
  channelType: ChannelTypeSchema,
})

export type GetChannelsParamsType = zod.infer<typeof GetChannelsParamsSchema>

export const ChannelResponseSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  type: zod.number(),
  url: zod.string(),
})

export type ChannelResponseType = zod.infer<typeof ChannelResponseSchema>
