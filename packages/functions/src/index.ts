import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

import { onRequest } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import * as Logger from 'firebase-functions/logger'

import {
  GetEmojisParamsSchema,
  GetChannelsParamsSchema,
  GetMessagesParamsSchema,
} from '@global/types/dist/discord'
import { ErrorService, Response } from '@global/utils'

import * as Discord from './models/v1/discord'

import { validateCloud } from './middlewares/validation'

setGlobalOptions({
  maxInstances: 1,
  timeoutSeconds: 300,
})

export const login = onRequest({ cors: true }, async (req, res) => {
  try {
    const user = await Discord.loginWithCode(req.body.code, req.body.isDev)
    res.json(Response(200, 'Logged in with code', user))
  } catch (error) {
    Logger.error('Error retrieving user', error)
    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error logging in with code', null))
  }
})

export const emojis = onRequest({ cors: true }, async (req, res) => {
  try {
    const isValid = validateCloud({
      target: 'body',
      schema: GetEmojisParamsSchema,
    })

    if (!isValid) {
      res.json(Response(400, 'Invalid request', null))
      return
    }

    const emojis = await Discord.getEmojis(req.body)
    res.json(Response(200, 'Emojis retrieved', emojis))
  } catch (error) {
    Logger.error('Error retrieving user', error)

    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error retrieving emojis', null))
  }
})

export const user = onRequest({ cors: true }, async (req, res) => {
  try {
    const user = await Discord.getUser(req.body)
    res.json(Response(200, 'User retrieved', user))
  } catch (error) {
    Logger.error('Error retrieving user', error)

    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error retrieving user', null))
  }
})

export const messages = onRequest({ cors: true }, async (req, res) => {
  try {
    const isValid = validateCloud({
      target: 'body',
      schema: GetMessagesParamsSchema,
    })

    if (!isValid) {
      res.json(Response(400, 'Invalid request', null))
      return
    }

    const messages = await Discord.getMessages(req.body)
    res.json(Response(200, 'Messages retrieved', messages))
  } catch (error) {
    Logger.error('Error retrieving user', error)

    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error retrieving messages', null))
  }
})

export const channels = onRequest({ cors: true }, async (req, res) => {
  try {
    const isValid = validateCloud({
      target: 'body',
      schema: GetChannelsParamsSchema,
    })

    if (!isValid) {
      res.json(Response(400, 'Invalid request', null))
      return
    }

    const channels = await Discord.getChannels(req.body)
    res.json(Response(200, 'Channels retrieved', channels))
  } catch (error) {
    Logger.error('Error retrieving user', error)

    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error retrieving channels', null))
  }
})
