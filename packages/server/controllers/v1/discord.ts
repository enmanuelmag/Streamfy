import express from 'express'

import { Response } from '@global/utils'
import { GetChannelsParamsSchema, GetMessagesParamsSchema } from '@global/types/dist/discord'

import * as Discord from '../../models/v1/discord'

import { validate } from '../../middlewares/validation'

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const user = await Discord.loginWithCode(req.body.code)
    return res.json(Response(200, 'Logged in with code', user))
  } catch (error) {
    if (error instanceof Error) {
      return res.json(Response(400, error.message, null))
    }
    return res.json(Response(500, 'Error logging in with code', null))
  }
})

router.get('/emojis', async (_, res) => {
  try {
    const emojis = await Discord.getEmojis()
    return res.json(Response(200, 'Emojis retrieved', emojis))
  } catch (error) {
    if (error instanceof Error) {
      return res.json(Response(400, error.message, null))
    }
    return res.json(Response(500, 'Error retrieving emojis', null))
  }
})

router.post('/user', async (req, res) => {
  try {
    const user = await Discord.getUser(req.body)
    return res.json(Response(200, 'User retrieved', user))
  } catch (error) {
    if (error instanceof Error) {
      return res.json(Response(400, error.message, null))
    }
    return res.json(Response(500, 'Error retrieving user', null))
  }
})

router.post(
  '/messages',
  validate({
    schema: GetMessagesParamsSchema,
    target: 'body',
  }),
  async (req, res) => {
    try {
      const messages = await Discord.getMessages(req.body)
      return res.send(Response(200, 'Messages retrieved', messages))
    } catch (error) {
      if (error instanceof Error) {
        return res.send(Response(400, error.message, null))
      }
      return res.send(Response(500, 'Error retrieving messages', null))
    }
  },
)

router.post(
  '/channels',
  validate({
    schema: GetChannelsParamsSchema,
    target: 'body',
  }),
  async (req, res) => {
    try {
      const channels = await Discord.getChannels(req.body)
      return res.json(Response(200, 'Channels retrieved', channels))
    } catch (error) {
      if (error instanceof Error) {
        return res.json(Response(400, error.message, null))
      }
      return res.json(Response(500, 'Error retrieving channels', null))
    }
  },
)

export default router
