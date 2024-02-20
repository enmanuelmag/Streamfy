import zod from 'zod'
import { ChannelType } from 'discord.js'

/**
 * Definitions for LaughLoss model
 */

// Get Messages
export const GetMessagesParamsSchema = zod.object({
  channelId: zod.string(),
  limit: zod.number().optional(),
  before: zod.string().optional(),
  after: zod.string().optional(),
  around: zod.string().optional(),
  regex: zod.string().optional(),
})

export type GetMessagesParamsType = zod.infer<typeof GetMessagesParamsSchema>

export const MessageResponseSchema = zod.object({
  id: zod.string(),
  author: zod.object({
    id: zod.string(),
    username: zod.string(),
    globalName: zod.string().optional().nullable(),
    discriminator: zod.string(),
    accentColor: zod.number().optional().nullable(),
    avatar: zod.string().optional().nullable(),
  }),
  content: zod.string(),
  timestamp: zod.number(),
  attachments: zod.array(
    zod.object({
      id: zod.string(),
      attachment: zod.string(),
      description: zod.string().nullable(),
      contentType: zod.string().nullable(),
      size: zod.number(),
      url: zod.string(),
      height: zod.number().nullable(),
      width: zod.number().nullable(),
    }),
  ),
  reactions: zod.array(
    zod.object({
      id: zod.string(),
      count: zod.number(),
      emoji: zod.string(),
      imageURL: zod.string().optional().nullable(),
    }),
  ),
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
