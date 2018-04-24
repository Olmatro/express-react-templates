// @flow

import express from 'express'
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import ReactDOM from 'react-dom/server'
import htmlTemplate from './html-template'

const importAll = r =>
  r.keys().reduce((acc, k) => {
    const routeName = k.replace(/^\.\//, '').replace('.js', '')
    acc[routeName] = r(k).default
    return acc
  }, {})
const routeMap = importAll(require.context('./pages', true, /\.js$/))

class HTTPAPI {
  db: any
  app: any

  init = async () => {
    console.log('initing http api...')
//     this.db = await getDB(dbConfig)
    this.app = express()
    this._configureMiddleware()
    await this._configureRoutes()
    await new Promise(resolve => {
      this.app.listen(3003, () => {
        console.log('HTTP API Started on 3003')
        resolve()
      })
    })
  }

  _configureMiddleware = () => {
    this.app.use(fileUpload())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(bodyParser.json({ limit: '90mb' }))
    this.app.use(cookieParser())
    this.app.use(morgan('tiny'))
  }

  _configureRoutes = async () => {
    console.log('configuring routes...')
    for (const [route, componentFunc] of Object.entries(routeMap)) {
      this.app.get(`/${route}`, async (req, res) => {
        res.send(
          htmlTemplate({
            body: ReactDOM.renderToString(
              await componentFunc({ req, res, db: this.db })
            )
          })
        )
      })
    }
    this.app.get('*', async (req, res) => {
      res.send(
        htmlTemplate({
          body: ReactDOM.renderToString(
            await routeMap['404']({
              req,
              res,
              db: this.db,
              pages: Object.keys(routeMap)
            })
          )
        })
      )
    })
  }
}

export default HTTPAPI
