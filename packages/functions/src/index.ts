import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

import { onRequest } from 'firebase-functions/v2/https'
import { setGlobalOptions } from 'firebase-functions/v2'
import * as Logger from 'firebase-functions/logger'

import {
  GetEmojisParamsSchema,
  GetChannelsParamsSchema,
  GetMessagesParamsSchema,
  BingoCreateParamsType,
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

export const bingoCreate = onRequest({ cors: true, timeoutSeconds: 60 * 5 }, async (req, res) => {
  try {
    const isValid = validateCloud({
      target: 'body',
      schema: BingoCreateParamsType,
    })

    if (!isValid) {
      res.json(Response(400, 'Invalid request', null))
      return
    }

    const bingo = await Discord.createBingo(req.body)

    res.json(Response(200, 'Bingo created', bingo))
  } catch (error) {
    Logger.error('Error creating bingo', error)

    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error creating bingo', null))
  }
})

export const bingoTables = onRequest({ cors: true }, async (req, res) => {
  try {
    const bingoTables = await Discord.getBingoTables(req.body.discordUser)
    res.json(Response(200, 'Bingo tables retrieved', bingoTables))
  } catch (error) {
    Logger.error('Error retrieving bingo tables', error)

    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error retrieving bingo tables', null))
  }
})

export const bingoPlay = onRequest({ cors: true }, async (req, res) => {
  try {
    const bingo = await Discord.getBingo(
      req.body.bingoId,
      req.body.userName,
      String(req.ip || req.headers['x-forwarded-for']?.toString() || 'no-ip-found'),
    )
    res.json(Response(200, 'Bingo retrieved', bingo))
  } catch (error) {
    Logger.error('Error retrieving bingo', error)

    if (error instanceof ErrorService) {
      res.json(Response(400, error.message, null, error.code))
      return
    }
    res.json(Response(500, 'Error retrieving bingo', null))
  }
})
