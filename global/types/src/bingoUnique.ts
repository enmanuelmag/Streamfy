import zod from 'zod'

import { BingoUniqueSchema } from './discord'

export const Step1Schema = BingoUniqueSchema.omit({ id: true })

export type Step1Type = zod.infer<typeof Step1Schema>
