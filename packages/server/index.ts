import dotenv from 'dotenv'
dotenv.config({ path: '../../global/env/.env' })

import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'

import { Logger } from '@global/utils'

import DiscordV1 from './controllers/v1/discord'

const PORT = process.env.VITE_EXPRESS_PORT

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.use(helmet())

app.use(morgan('dev'))

app.use('/v1/discord', DiscordV1)

app.listen(PORT, () => Logger.info(`Server is listening on: http://localhost:${PORT}`))
