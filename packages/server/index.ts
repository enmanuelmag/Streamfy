import dotenv from 'dotenv'
dotenv.config({ path: '../../env/.env' })

import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'

import { Logger } from '@global/utils/log'

import LaughLoss from './controllers/laughLoss'

const PORT = process.env.VITE_EXPRESS_PORT

const app = express()

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.use(helmet())

app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/laughLoss', LaughLoss)

app.listen(PORT, () => Logger.info(`Server is listening on: http://localhost:${PORT}`))
