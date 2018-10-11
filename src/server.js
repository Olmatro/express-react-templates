// @flow

import express from 'express'
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'path'
import ReactDOM from 'react-dom/server'
import htmlTemplate from './html-template'
import { isValidElement } from 'react'

const importAll = r =>
  r.keys().reduce((acc, k) => {
    const routeName = k.replace(/^\.\//, '').replace('index.page.js', '').replace('.page.js', '')
    const module = r(k)
    acc[module.routeName ? module.routeName.replace(/^\//, '') : routeName] =
      module.default
    return acc
  }, {})
const routeMap = importAll(require.context('./pages', true, /\.page\.js$/))

class HTTPAPI {
  db: any
  app: any
  server: any

  init = async () => {
    console.log('initing http api...')
    //     this.db = await getDB(dbConfig)
    this.app = express()
    this._configureMiddleware()
    await this._configureRoutes()
    await new Promise(resolve => {
      server = this.app.listen(3003, () => {
        console.log('HTTP API Started on 3003')
        resolve()
      })
    })
  }
  
  destroy = async () => {
    if (server) {
      server.close()
      server = null
    }
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
      this.app.all(`/${route}`, async (req, res) => {
        try {
          const renderedComponent = await componentFunc({ req, res, db: this.db })

          if (isValidElement(renderedComponent)) {
            res.send(
              htmlTemplate({
                body: ReactDOM.renderToString(renderedComponent)
              })
            )
          } else {
            res.json(renderedComponent)
          }
        } catch (e) {
          res.status(500).json({ success: false, message: e.toString() })
        }
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
