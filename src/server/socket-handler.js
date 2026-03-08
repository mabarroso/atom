function safeHandler (socket, handler) {
  return (...args) => {
    try {
      handler(...args)
    } catch (error) {
      console.error('Socket handler error:', error)
      socket.emit('error:internal', { message: 'Error interno del servidor' })
    }
  }
}

function registerSocketHandlers (io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)
    io.emit('server:statusUpdate', { online: io.engine.clientsCount })

    socket.on('client:ping', safeHandler(socket, () => {
      socket.emit('server:pong', { timestamp: Date.now() })
    }))

    socket.on('client:statusRequest', safeHandler(socket, () => {
      socket.emit('server:statusUpdate', { online: io.engine.clientsCount })
    }))

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id} (${reason})`)
      io.emit('server:statusUpdate', { online: io.engine.clientsCount })
    })
  })
}

module.exports = {
  registerSocketHandlers,
  safeHandler
}
