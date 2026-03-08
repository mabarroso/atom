const {
  createGame,
  getGame,
  getGameState,
  processMove,
  recoverConnection,
  handleDisconnect,
  cleanupIdleGames
} = require('./game/game-engine')

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
  const socketToPlayer = new Map()

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`)
    io.emit('server:statusUpdate', { online: io.engine.clientsCount })

    socket.on('client:ping', safeHandler(socket, () => {
      socket.emit('server:pong', { timestamp: Date.now() })
    }))

    socket.on('client:statusRequest', safeHandler(socket, () => {
      socket.emit('server:statusUpdate', { online: io.engine.clientsCount })
    }))

    socket.on('client:game:start', safeHandler(socket, (payload = {}) => {
      const boardSize = payload.boardSize
      const playerName = payload.playerName
      const requestedGameId = payload.gameId

      let game = null
      let playerNumber = 1

      if (requestedGameId) {
        game = getGame(requestedGameId)
      }

      if (game && game.players[2].socketId === null) {
        playerNumber = 2
      } else if (!game) {
        game = createGame(null, boardSize, {
          1: {
            name: playerName || 'Jugador 1',
            connected: true,
            socketId: socket.id
          },
          2: {
            name: 'Jugador 2',
            connected: false,
            socketId: null
          }
        })
      } else {
        socket.emit('error:game:roomFull', { message: 'La partida ya tiene dos jugadores' })
        return
      }

      game.setPlayerConnected(playerNumber, true, socket.id)
      if (playerName) {
        game.players[playerNumber].name = playerName
      }

      socket.join(game.roomId)
      socketToPlayer.set(socket.id, { gameId: game.gameId, player: playerNumber })

      recoverConnection(game.gameId, playerNumber, socket.id)

      io.to(game.roomId).emit('server:game:started', {
        gameId: game.gameId,
        roomId: game.roomId,
        players: game.players,
        state: game.toJSON()
      })
    }))

    socket.on('client:game:stateRequest', safeHandler(socket, () => {
      const assignment = socketToPlayer.get(socket.id)
      if (!assignment) {
        return
      }

      const state = getGameState(assignment.gameId)
      if (state) {
        socket.emit('server:game:stateUpdate', {
          gameId: assignment.gameId,
          state
        })
      }
    }))

    socket.on('client:game:move', safeHandler(socket, ({ row, col }) => {
      const assignment = socketToPlayer.get(socket.id)
      if (!assignment) {
        socket.emit('error:game:notFound', { message: 'Partida no encontrada' })
        return
      }

      const result = processMove(assignment.gameId, assignment.player, Number(row), Number(col))
      if (!result.ok) {
        socket.emit(result.error.code, { message: result.error.message })
        return
      }

      io.to(result.state.roomId).emit('server:game:stateUpdate', {
        gameId: assignment.gameId,
        state: result.state,
        animationSequence: result.animationSequence,
        truncated: result.truncated
      })

      io.to(result.state.roomId).emit('server:game:turnChanged', {
        gameId: assignment.gameId,
        currentPlayer: result.state.currentPlayer
      })

      if (result.winner) {
        io.to(result.state.roomId).emit('server:game:ended', {
          gameId: assignment.gameId,
          winner: result.state.winner,
          reason: result.state.winReason,
          state: result.state
        })
      }
    }))

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id} (${reason})`)
      io.emit('server:statusUpdate', { online: io.engine.clientsCount })

      const assignment = socketToPlayer.get(socket.id)
      if (assignment) {
        const state = handleDisconnect(assignment.gameId, assignment.player, (forfeitState) => {
          io.to(forfeitState.roomId).emit('server:game:stateUpdate', {
            gameId: assignment.gameId,
            state: forfeitState
          })

          io.to(forfeitState.roomId).emit('server:game:ended', {
            gameId: assignment.gameId,
            winner: forfeitState.winner,
            reason: forfeitState.winReason,
            state: forfeitState
          })
        })
        socketToPlayer.delete(socket.id)

        if (state) {
          io.to(state.roomId).emit('server:game:stateUpdate', {
            gameId: assignment.gameId,
            state
          })

          if (state.state === 'ENDED') {
            io.to(state.roomId).emit('server:game:ended', {
              gameId: assignment.gameId,
              winner: state.winner,
              reason: state.winReason,
              state
            })
          }
        }
      }

      cleanupIdleGames()
    })
  })
}

module.exports = {
  registerSocketHandlers,
  safeHandler
}
