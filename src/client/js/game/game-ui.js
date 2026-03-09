import { createGameStateManager } from './game-state-manager.js'
import { createAnimationQueue } from './animation-queue.js'
import { createGameBoard } from './game-board.js'
import { DEFAULT_BOARD_SIZE } from './constants.js'

function byId (id) {
  return document.getElementById(id)
}

/**
 * Initialize Atom game UI interactions and socket event bindings.
 * @param {import('../socket-client.js').createSocketClient} socket
 */
export function initGameUI (socket) {
  const gameContainer = byId('game-container')
  const boardContainer = byId('game-board')
  const turnIndicator = byId('turn-indicator')
  const gameNotice = byId('game-notice')
  const playerOneIndicator = byId('player-1-indicator')
  const playerTwoIndicator = byId('player-2-indicator')
  const newGameButton = byId('btn-new-game')
  const restartButton = byId('btn-restart-game')
  const joinGameButton = byId('btn-join-game')
  const joinGameInput = byId('join-game-id')
  const boardSizeSelect = byId('board-size')
  const gameModeHuman = byId('game-mode-human')
  const gameModeMachine = byId('game-mode-machine')
  const gameIdValue = byId('game-id-value')

  if (!gameContainer || !boardContainer) {
    return
  }

  const stateManager = createGameStateManager()
  const animationQueue = createAnimationQueue()
  const gameBoard = createGameBoard(boardContainer, {
    onMove: (row, col) => {
      const state = stateManager.getState()
      if (!state) {
        return
      }

      stateManager.applyOptimisticMove(row, col, state.currentPlayer)
      socket.emit('client:game:move', { row, col })
    }
  })

  let joinedGameId = null

  function updatePlayerIndicators (players, currentPlayer) {
    const playerOne = players[1]
    const playerTwo = players[2]

    playerOneIndicator.textContent = `${playerOne.name}${playerOne.connected ? '' : ' (desconectado)'}`
    playerTwoIndicator.textContent = `${playerTwo.name}${playerTwo.connected ? '' : ' (desconectado)'}`

    playerOneIndicator.classList.toggle('is-current', currentPlayer === 1)
    playerTwoIndicator.classList.toggle('is-current', currentPlayer === 2)
  }

  function getSelectedGameMode () {
    if (gameModeMachine?.checked) {
      return 'machine'
    }

    return 'human'
  }

  stateManager.subscribe((state) => {
    if (!state) {
      return
    }

    gameBoard.render(state)

    const currentPlayerName = state.players[state.currentPlayer]?.name || `Jugador ${state.currentPlayer}`
    turnIndicator.textContent = `Turno de ${currentPlayerName}`
    updatePlayerIndicators(state.players, state.currentPlayer)

    if (state.state === 'ENDED') {
      const reason = state.winReason === 'forfeit' ? ' por abandono' : ''
      gameNotice.textContent = `¡Jugador ${state.winner} gana${reason}!`
    }
  })

  socket.on('server:game:started', ({ gameId, machineMode, state }) => {
    joinedGameId = gameId
    gameIdValue.textContent = gameId
    joinGameInput.value = gameId
    gameContainer.classList.remove('d-none')
    if (machineMode === true || state?.machineMode === true) {
      gameNotice.textContent = 'Partida iniciada contra Máquina'
      if (gameModeMachine) gameModeMachine.checked = true
    } else {
      gameNotice.textContent = 'Partida iniciada'
      if (gameModeHuman) gameModeHuman.checked = true
    }
    stateManager.updateFromServer(state)
  })

  socket.on('server:game:stateUpdate', ({ state, animationSequence = [] }) => {
    stateManager.updateFromServer(state)
    animationQueue.playExplosionSequence(animationSequence, (step) => {
      gameBoard.flashExplosion(step.row, step.col)
      gameBoard.flashTransfer(step.row, step.col)
    })
  })

  animationQueue.setOnIdle(() => {
    const state = stateManager.getState()
    if (state) {
      stateManager.updateFromServer(state)
    }
  })

  socket.on('server:game:ended', ({ state }) => {
    stateManager.updateFromServer(state)
  })

  socket.on('server:game:machineMove', ({ row, col }) => {
    gameBoard.flashTransfer(row, col)
  })

  socket.on('error:game:invalidMove', ({ message }) => {
    stateManager.revertOptimisticMove()
    gameNotice.textContent = message || 'Movimiento inválido'
  })

  socket.on('error:game:notYourTurn', ({ message }) => {
    stateManager.revertOptimisticMove()
    gameNotice.textContent = message || 'No es tu turno'
  })

  socket.on('error:game:notActive', ({ message }) => {
    stateManager.revertOptimisticMove()
    gameNotice.textContent = message || 'La partida no está activa'
  })

  socket.on('error:game:roomFull', ({ message }) => {
    gameNotice.textContent = message || 'La partida ya tiene dos jugadores'
  })

  socket.on('error:game:notFound', ({ message }) => {
    gameNotice.textContent = message || 'Partida no encontrada'
  })

  function getSelectedBoardSize () {
    const parsed = Number(boardSizeSelect.value)
    return Number.isInteger(parsed) ? parsed : DEFAULT_BOARD_SIZE
  }

  newGameButton.addEventListener('click', () => {
    socket.emit('client:game:start', {
      boardSize: getSelectedBoardSize(),
      machineMode: getSelectedGameMode() === 'machine'
    })
  })

  restartButton.addEventListener('click', () => {
    if (!window.confirm('¿Reiniciar la partida actual?')) {
      return
    }

    socket.emit('client:game:start', {
      boardSize: getSelectedBoardSize(),
      gameId: joinedGameId,
      machineMode: getSelectedGameMode() === 'machine'
    })
  })

  joinGameButton.addEventListener('click', () => {
    const gameId = joinGameInput.value.trim()
    if (!gameId) {
      gameNotice.textContent = 'Ingresa un ID de partida para unirte'
      return
    }

    socket.emit('client:game:start', {
      boardSize: getSelectedBoardSize(),
      gameId
    })
  })
}
