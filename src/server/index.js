const path = require('path')
const http = require('http')
const express = require('express')
const { Server } = require('socket.io')
const { registerSocketHandlers } = require('./socket-handler')

function createApp () {
  const app = express()
  const clientPath = path.resolve(__dirname, '../client')

  app.use(express.static(clientPath))

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' })
  })

  app.get('/boom', (_req, _res, next) => {
    next(new Error('Boom'))
  })

  app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err)
    res.status(500).json({ error: 'Error interno del servidor' })
  })

  return app
}

function createServer (port = Number(process.env.PORT) || 3000) {
  const app = createApp()
  const httpServer = http.createServer(app)
  const io = new Server(httpServer, {
    cors: false,
    connectionStateRecovery: {},
    allowEIO3: false
  })

  registerSocketHandlers(io)

  return { app, httpServer, io, port }
}

function startServer () {
  const { httpServer, port } = createServer()

  httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`)
      process.exitCode = 1
      return
    }

    console.error('Server startup error:', error)
    process.exitCode = 1
  })

  httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })

  const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`)
    httpServer.close(() => {
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  return httpServer
}

if (require.main === module) {
  startServer()
}

module.exports = {
  createApp,
  createServer,
  startServer
}
