import zod from 'zod'

export const ResponseSchema = zod.object({
  status: zod.number(),
  message: zod.string(),
  data: zod.unknown(),
})

export type ResponseType<T> = {
  status: number
  message: string
  data: T
  code: string
}
