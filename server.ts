import dotenv from 'dotenv'

import ItemController from './src/controllers/apiv1/Item.controller'
import mongoose from 'mongoose'

import express from 'express'
import bodyParser from 'body-parser'

dotenv.config()
export const PORT: number = parseInt(process.env.port ? process.env.port : '8000')
const MONGO_URI: string = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_URI}/${process.env.MONGO_DBNAME}`

// TODO: organize this elsewhere. Having issues with wrapping app within a class due to supertest scoping restrictions.
export const makeServer = () => {
  const app: express.Application = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use('/apiv1', new ItemController().getRouter())
  return app
}

if (process.env.NODE_ENV !== 'test') {
  console.log("I AM CONNECTING")
  mongoose.connect(MONGO_URI).then((value: typeof mongoose) => {
    const app = makeServer()
    app.listen(PORT, () => {
      console.log(`Tyin Server is running at http://localhost:${PORT}`)
    })
  }).catch((e) => { console.error(e) }).finally()
}


