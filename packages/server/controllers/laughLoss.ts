import express from 'express'

import * as LaughLoss from '../models/laughLoss'
import { Response } from '../utils/response'

const router = express.Router()

router.post('/messages', async (req, res) => {
  try {
    const messages = await LaughLoss.getMessages(req.body)
    return res.send(Response(200, 'Messages retrieved', messages))
  } catch (error) {
    if (error instanceof Error) {
      return res.send(Response(400, error.message, null))
    }
    return res.send(Response(500, 'Error retrieving messages', null))
  }
})

router.get('/channels', async (req, res) => {
  try {
    const channels = await LaughLoss.getChannels()
    return res.send(Response(200, 'Channels retrieved', channels))
  } catch (error) {
    if (error instanceof Error) {
      return res.send(Response(400, error.message, null))
    }
    return res.send(Response(500, 'Error retrieving channels', null))
  }
})

export default router
