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
  const pendingTurnTimers = new Map()

  function clearPendingTurnTimer (gameId) {
    const timer = pendingTurnTimers.get(gameId)
    if (timer) {
      clearTimeout(timer)
      pendingTurnTimers.delete(gameId)
    }
  }

  function emitStateUpdate (gameId, state, extra = {}) {
    io.to(state.roomId).emit('server:game:stateUpdate', {
      gameId,
      machineMode: state.machineMode,
      state,
      ...extra
    })
  }

  function emitTurnChanged (gameId, state) {
    io.to(state.roomId).emit('server:game:turnChanged', {
      gameId,
      currentPlayer: state.currentPlayer
    })
  }

  function emitEnded (gameId, state) {
    io.to(state.roomId).emit('server:game:ended', {
      gameId,
      winner: state.winner,
      reason: state.winReason,
      state
    })
  }

  function scheduleMachineMove (gameId, priorCascadeDelayMs = 0) {
    const game = getGame(gameId)
    if (!game || game.state !== 'ACTIVE' || game.machineMode !== true || game.currentPlayer !== 2) {
      return
    }

    const plannedMove = getMachinePlannedMove(gameId)
    if (!plannedMove) {
      const winner = game.checkWinner() || 1
      game.end(winner, 'noMoves')
      const endedState = game.toJSON()
      clearPendingTurnTimer(gameId)
      emitStateUpdate(gameId, endedState)
      emitEnded(gameId, endedState)
      return
    }

    const machineDelayMs = Number.isFinite(game.machineResponseDelayMs)
      ? Math.max(0, Number(game.machineResponseDelayMs))
      : 0
    const cascadeDelayMs = Number.isFinite(Number(priorCascadeDelayMs))
      ? Math.max(0, Number(priorCascadeDelayMs))
      : 0
    const effectiveMachineDelayMs = Math.max(0, machineDelayMs - cascadeDelayMs)

    setTimeout(() => {
      const freshGame = getGame(gameId)
      if (!freshGame || freshGame.state !== 'ACTIVE' || freshGame.currentPlayer !== 2) {
        return
      }

      if (typeof freshGame.isActionLocked === 'function' && freshGame.isActionLocked()) {
        return
      }

      const machineResult = processMove(gameId, 2, plannedMove.row, plannedMove.col)
      if (!machineResult.ok) {
        io.to(freshGame.roomId).emit('error:internal', { message: 'Error interno del servidor' })
        return
      }

      emitStateUpdate(gameId, machineResult.state, {
        moveOrigin: { row: plannedMove.row, col: plannedMove.col },
        animationSequence: machineResult.animationSequence,
        truncated: machineResult.truncated
      })

      const machineAtoms = machineResult.state?.board?.cells?.[plannedMove.row]?.[plannedMove.col]?.atoms ?? null
      io.to(machineResult.state.roomId).emit('server:game:machineMove', {
        gameId,
        row: plannedMove.row,
        col: plannedMove.col,
        atoms: machineAtoms
      })

      if (machineResult.winner) {
        clearPendingTurnTimer(gameId)
        emitEnded(gameId, machineResult.state)
        return
      }

      if (machineResult.pendingTurn) {
        scheduleTurnHandoff(gameId, machineResult.pendingTurn)
        return
      }

      emitTurnChanged(gameId, machineResult.state)
    }, effectiveMachineDelayMs)
  }

  function scheduleTurnHandoff (gameId, pendingTurn) {
    clearPendingTurnTimer(gameId)

    const requestedDelayMs = Number(pendingTurn?.delayMs)
    const initialDelayMs = Number.isFinite(requestedDelayMs) ? Math.max(0, requestedDelayMs) : 0

    const timer = setTimeout(() => {
      const game = getGame(gameId)
      if (!game || game.state !== 'ACTIVE') {
        pendingTurnTimers.delete(gameId)
        return
      }

      if (Number.isInteger(pendingTurn?.fromPlayer) && game.currentPlayer !== pendingTurn.fromPlayer) {
        pendingTurnTimers.delete(gameId)
        return
      }

      const remainingMs = typeof game.getActionLockRemainingMs === 'function'
        ? game.getActionLockRemainingMs()
        : 0
      if (remainingMs > 0) {
        scheduleTurnHandoff(gameId, { ...pendingTurn, delayMs: remainingMs })
        return
      }

      game.switchTurn()
      const switchedState = game.toJSON()
      pendingTurnTimers.delete(gameId)

      emitStateUpdate(gameId, switchedState)
      emitTurnChanged(gameId, switchedState)

      if (switchedState.machineMode === true && switchedState.currentPlayer === 2) {
        const cascadeDelayMs = Number.isFinite(Number(pendingTurn?.cascadeDelayMs))
          ? Math.max(0, Number(pendingTurn.cascadeDelayMs))
          : 0
        scheduleMachineMove(gameId, cascadeDelayMs)
      }
    }, initialDelayMs)

    pendingTurnTimers.set(gameId, timer)
  }

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

      emitStateUpdate(assignment.gameId, result.state, {
        moveOrigin: { row: Number(row), col: Number(col) },
        animationSequence: result.animationSequence,
        truncated: result.truncated
      })

      if (result.winner) {
        clearPendingTurnTimer(assignment.gameId)
        emitEnded(assignment.gameId, result.state)
        return
      }

      if (result.pendingTurn) {
        scheduleTurnHandoff(assignment.gameId, result.pendingTurn)
        return
      }

      emitTurnChanged(assignment.gameId, result.state)

      if (result.state.machineMode === true && result.state.currentPlayer === 2) {
        scheduleMachineMove(assignment.gameId)
      }
    }))

    socket.on('client:game:updateTiming', safeHandler(socket, (payload = {}) => {
      const assignment = socketToPlayer.get(socket.id)
      if (!assignment) {
        socket.emit('error:game:notFound', { message: 'Partida no encontrada' })
        return
      }

      const game = getGame(assignment.gameId)
      if (!game) {
        socket.emit('error:game:notFound', { message: 'Partida no encontrada' })
        return
      }

      if (game.state !== 'ACTIVE') {
        socket.emit('error:game:notActive', { message: 'La partida no está activa' })
        return
      }

      game.setTimingSettings({
        animationDelayMs: payload.animationDelayMs,
        machineResponseDelayMs: payload.machineResponseDelayMs
      })

      const state = game.toJSON()
      emitStateUpdate(assignment.gameId, state)
    }))

    socket.on('client:game:revealAtomCounters', safeHandler(socket, () => {
      const assignment = socketToPlayer.get(socket.id)
      if (!assignment) {
        socket.emit('error:game:notFound', { message: 'Partida no encontrada' })
        return
      }

      const game = getGame(assignment.gameId)
      if (!game) {
        socket.emit('error:game:notFound', { message: 'Partida no encontrada' })
        return
      }

      if (game.state !== 'ACTIVE') {
        socket.emit('error:game:notActive', { message: 'La partida no está activa' })
        return
      }

      if (assignment.player !== 1) {
        socket.emit('error:game:notAllowed', { message: 'Solo Jugador 1 puede revelar contadores' })
        return
      }

      game.revealAtomCounters()
      const state = game.toJSON()

      emitStateUpdate(assignment.gameId, state)
    }))

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id} (${reason})`)
      io.emit('server:statusUpdate', { online: io.engine.clientsCount })

      const assignment = socketToPlayer.get(socket.id)
      if (assignment) {
        const state = handleDisconnect(assignment.gameId, assignment.player, (forfeitState) => {
          clearPendingTurnTimer(assignment.gameId)
          emitStateUpdate(assignment.gameId, forfeitState)
          emitEnded(assignment.gameId, forfeitState)
        })
        socketToPlayer.delete(socket.id)

        if (state) {
          emitStateUpdate(assignment.gameId, state)

          if (state.state === 'ENDED') {
            clearPendingTurnTimer(assignment.gameId)
            emitEnded(assignment.gameId, state)
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
