import zod from 'zod'

import { BingoSchema } from './discord'

export const Step1Schema = BingoSchema.omit({ id: true })

export type Step1Type = zod.infer<typeof Step1Schema>
