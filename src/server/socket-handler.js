const {
  createGame,
  getGame,
  getGameState,
  getMachinePlannedMove,
  processMove,
  recoverConnection,
  handleDisconnect,
  cleanupIdleGames
} = require('./game/game-engine')

const MACHINE_MOVE_DELAY_MS = 2000

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
      const assignment = socketToPlayer.get(socket.id)
      if (!assignment) {
        socket.emit('server:statusUpdate', { online: io.engine.clientsCount })
        return
      }

      const state = getGameState(assignment.gameId)
      socket.emit('server:statusUpdate', {
        online: io.engine.clientsCount,
        gameId: assignment.gameId,
        machineMode: state?.machineMode ?? false
      })
    }))

    socket.on('client:game:start', safeHandler(socket, (payload = {}) => {
      const boardSize = payload.boardSize
      const playerName = payload.playerName
      const requestedGameId = payload.gameId
      const machineMode = payload.machineMode === true

      let game = null
      let playerNumber = 1

      if (requestedGameId) {
        game = getGame(requestedGameId)
      }

      if (game && game.machineMode) {
        socket.emit('error:game:roomFull', { message: 'La partida contra máquina no admite segundo jugador' })
        return
      }

      if (game && game.players[2].socketId === null) {
        playerNumber = 2
      } else if (!game) {
        game = createGame(null, boardSize, {
          1: {
            name: playerName || 'Jugador 1',
            isHuman: true,
            connected: true,
            socketId: socket.id
          },
          2: {
            name: machineMode ? 'Machine' : 'Jugador 2',
            isHuman: !machineMode,
            connected: machineMode,
            socketId: null
          }
        }, {
          machineMode
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
        machineMode: game.machineMode,
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
          machineMode: state.machineMode,
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
        machineMode: result.state.machineMode,
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
        return
      }

      if (result.state.machineMode === true && result.state.currentPlayer === 2) {
        const plannedMove = getMachinePlannedMove(assignment.gameId)
        if (!plannedMove) {
          const game = getGame(assignment.gameId)
          if (game && game.state === 'ACTIVE') {
            const winner = game.checkWinner() || 1
            game.end(winner, 'noMoves')
            const endedState = game.toJSON()

            io.to(endedState.roomId).emit('server:game:stateUpdate', {
              gameId: assignment.gameId,
              machineMode: endedState.machineMode,
              state: endedState
            })

            io.to(endedState.roomId).emit('server:game:ended', {
              gameId: assignment.gameId,
              winner: endedState.winner,
              reason: endedState.winReason,
              state: endedState
            })
          }
          return
        }

        setTimeout(() => {
          const game = getGame(assignment.gameId)
          if (!game || game.state !== 'ACTIVE' || game.currentPlayer !== 2) {
            return
          }

          const previewAtoms = game.board.getAtomCount(plannedMove.row, plannedMove.col) + 1
          io.to(game.roomId).emit('server:game:machineMove', {
            gameId: assignment.gameId,
            row: plannedMove.row,
            col: plannedMove.col,
            atoms: previewAtoms
          })

          const machineResult = processMove(assignment.gameId, 2, plannedMove.row, plannedMove.col)
          if (!machineResult.ok) {
            io.to(game.roomId).emit('error:internal', { message: 'Error interno del servidor' })
            return
          }

          io.to(machineResult.state.roomId).emit('server:game:stateUpdate', {
            gameId: assignment.gameId,
            machineMode: machineResult.state.machineMode,
            state: machineResult.state,
            animationSequence: machineResult.animationSequence,
            truncated: machineResult.truncated
          })

          io.to(machineResult.state.roomId).emit('server:game:turnChanged', {
            gameId: assignment.gameId,
            currentPlayer: machineResult.state.currentPlayer
          })

          if (machineResult.winner) {
            io.to(machineResult.state.roomId).emit('server:game:ended', {
              gameId: assignment.gameId,
              winner: machineResult.state.winner,
              reason: machineResult.state.winReason,
              state: machineResult.state
            })
          }
        }, MACHINE_MOVE_DELAY_MS)
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
