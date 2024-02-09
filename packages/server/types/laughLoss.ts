import zod from 'zod'

export const GetMessagesParamsSchema = zod.object({
  channelId: zod.string(),
  limit: zod.number().optional(),
  before: zod.string().optional(),
  after: zod.string().optional(),
  around: zod.string().optional(),
})

export type GetMessagesParamsType = zod.infer<typeof GetMessagesParamsSchema>
