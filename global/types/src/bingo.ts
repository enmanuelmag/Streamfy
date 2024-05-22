import zod from 'zod'

export const Step1Schema = zod.object({
  title: zod.string().min(1).max(100),
  description: zod.string().min(1).max(1000).nullable().optional(),
  sentences: zod.string().min(1),
  layout: zod.enum(['3x3', '4x4', '5x5', '6x6']),
})

export type Step1Type = zod.infer<typeof Step1Schema>
