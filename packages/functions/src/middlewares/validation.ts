import { NextFunction, Response, Request } from 'express'
import { AnyZodObject } from 'zod'
import jwt from 'jsonwebtoken'

import { ErrorCodes, ErrorService, Logger } from '@global/utils'

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

export const validateToken = async (token?: string) => {
  try {
    const decoded = jwt.verify(token || '', process.env.VITE_SECRET_TOKEN || '')

    Logger.info('DECODED TOKEN', Boolean(decoded))
  } catch (error) {
    Logger.error('Error validating token', error)
    const { code, message } = ErrorCodes.ERROR_TOKEN_USER
    throw new ErrorService(code, message)
  }
}
