import { NextFunction, Response, Request } from 'express'
import { AnyZodObject } from 'zod'

type ValidateParams = {
  schema: AnyZodObject
  target: 'body' | 'query' | 'params'
}
export const validate =
  (params: ValidateParams) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req[params.target]) {
        return res.status(400).json({ error: `Missing ${params.target}` })
      }

      await params.schema.parseAsync(req[params.target])

      return next()
    } catch (error) {
      return res.status(400).json(error)
    }
  }

export const validateCloud = (params: ValidateParams) => async (data: boolean) => {
  try {
    await params.schema.parseAsync(data)
    return true
  } catch (error) {
    return false
  }
}
