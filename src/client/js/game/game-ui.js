import { createGameStateManager } from './game-state-manager.js'
import { createAnimationQueue } from './animation-queue.js'
import { createGameBoard } from './game-board.js'
import {
  DEFAULT_BOARD_SIZE,
  DEFAULT_ANIMATION_DELAY,
  MIN_ANIMATION_DELAY_MS,
  MAX_ANIMATION_DELAY_MS,
  ANIMATION_DELAY_STEP_MS,
  DEFAULT_MACHINE_RESPONSE_DELAY_MS,
  MIN_MACHINE_RESPONSE_DELAY_MS,
  MAX_MACHINE_RESPONSE_DELAY_MS,
  MACHINE_RESPONSE_DELAY_STEP_MS
} from './constants.js'

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
  const roundNumberIndicator = byId('round-number-indicator')
  const turnIndicator = byId('turn-indicator')
  const gameNotice = byId('game-notice')
  const playerOneIndicator = byId('player-1-indicator')
  const playerTwoIndicator = byId('player-2-indicator')
  const newGameButton = byId('btn-new-game')
  const restartButton = byId('btn-restart-game')
  const openSettingsButton = byId('btn-open-settings')
  const closeSettingsButton = byId('btn-close-settings')
  const settingsPanel = byId('settings-panel')
  const revealCountersButton = byId('btn-reveal-counters')
  const joinGameButton = byId('btn-join-game')
  const joinGameInput = byId('join-game-id')
  const boardSizeSelect = byId('board-size')
  const gameModeHuman = byId('game-mode-human')
  const gameModeMachine = byId('game-mode-machine')
  const gameIdValue = byId('game-id-value')
  const animationDelayControl = byId('animation-delay-control')
  const machineDelayControl = byId('machine-delay-control')
  const animationDelayValue = byId('animation-delay-value')
  const machineDelayValue = byId('machine-delay-value')
  const atomCountersPanel = byId('atom-counters-panel')
  const atomCounterPlayerOne = byId('atom-counter-player-1')
  const atomCounterPlayerTwo = byId('atom-counter-player-2')
  const atomCounterTotal = byId('atom-counter-total')

  if (!gameContainer || !boardContainer) {
    return
  }

  const stateManager = createGameStateManager()
  const animationQueue = createAnimationQueue()
  let pendingFinalAnimationState = null
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
  let isSettingsPanelOpen = false

  function setSettingsPanelOpen (nextOpen) {
    isSettingsPanelOpen = Boolean(nextOpen)
    if (settingsPanel) {
      settingsPanel.classList.toggle('d-none', !isSettingsPanelOpen)
    }

    if (openSettingsButton) {
      openSettingsButton.setAttribute('aria-expanded', isSettingsPanelOpen ? 'true' : 'false')
    }
  }

  function clampValue (value, min, max, fallback, step) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) {
      return fallback
    }

    const clamped = Math.min(max, Math.max(min, parsed))
    return Math.round(clamped / step) * step
  }

  function getTimingFromState (state) {
    return {
      animationDelayMs: clampValue(
        state?.animationDelayMs,
        MIN_ANIMATION_DELAY_MS,
        MAX_ANIMATION_DELAY_MS,
        DEFAULT_ANIMATION_DELAY,
        ANIMATION_DELAY_STEP_MS
      ),
      machineResponseDelayMs: clampValue(
        state?.machineResponseDelayMs,
        MIN_MACHINE_RESPONSE_DELAY_MS,
        MAX_MACHINE_RESPONSE_DELAY_MS,
        DEFAULT_MACHINE_RESPONSE_DELAY_MS,
        MACHINE_RESPONSE_DELAY_STEP_MS
      )
    }
  }

  function emitTimingUpdate (nextTiming) {
    socket.emit('client:game:updateTiming', nextTiming)
  }

  function updateTimingControls (state) {
    if (!animationDelayControl || !machineDelayControl) {
      return
    }

    const timing = getTimingFromState(state)
    animationDelayControl.value = String(timing.animationDelayMs)
    machineDelayControl.value = String(timing.machineResponseDelayMs)

    if (animationDelayValue) {
      animationDelayValue.textContent = String(timing.animationDelayMs)
    }

    if (machineDelayValue) {
      machineDelayValue.textContent = String(timing.machineResponseDelayMs)
    }

    const controlsEnabled = state.state === 'ACTIVE'
    animationDelayControl.disabled = !controlsEnabled
    machineDelayControl.disabled = !controlsEnabled
  }

  function getLocalPlayerId (state) {
    if (!state || !socket.id) {
      return null
    }

    if (state.players[1]?.socketId === socket.id) {
      return 1
    }

    if (state.players[2]?.socketId === socket.id) {
      return 2
    }

    return null
  }

  function updateAtomCounters (state) {
    const localPlayerId = getLocalPlayerId(state)
    const canRevealCounters = localPlayerId === 1 && state.state === 'ACTIVE' && state.atomCountersVisible !== true

    if (revealCountersButton) {
      revealCountersButton.classList.toggle('d-none', !canRevealCounters)
      revealCountersButton.disabled = !canRevealCounters
    }

    if (!atomCountersPanel || !atomCounterPlayerOne || !atomCounterPlayerTwo || !atomCounterTotal) {
      return
    }

    const counters = state.atomCounters || { player1: 0, player2: 0, total: 0 }
    atomCounterPlayerOne.textContent = String(counters.player1 ?? 0)
    atomCounterPlayerTwo.textContent = String(counters.player2 ?? 0)
    atomCounterTotal.textContent = String(counters.total ?? 0)

    atomCountersPanel.classList.toggle('d-none', state.atomCountersVisible !== true)
  }

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

    const roundNumber = Number.isInteger(state.roundNumber)
      ? state.roundNumber
      : Math.max(1, Math.floor(((Number.isInteger(state.turn) ? state.turn : 1) + 1) / 2))
    const currentPlayerName = state.players[state.currentPlayer]?.name || `Jugador ${state.currentPlayer}`
    if (Number.isInteger(roundNumber) && roundNumberIndicator) {
      roundNumberIndicator.textContent = `Ronda #${roundNumber}`
    }
    turnIndicator.textContent = `Turno de ${currentPlayerName}`
    updatePlayerIndicators(state.players, state.currentPlayer)
    updateAtomCounters(state)
    updateTimingControls(state)

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
    stateManager.updateFromServer(state, { resetLastMove: true })
  })

  socket.on('server:game:stateUpdate', ({ state, moveOrigin, animationSequence = [] }) => {
    if (!Array.isArray(animationSequence) || animationSequence.length === 0) {
      pendingFinalAnimationState = null
      stateManager.updateFromServer(state, { moveOrigin })
      return
    }

    pendingFinalAnimationState = state
    let shouldApplyMoveOrigin = true

    animationQueue.playExplosionSequence(animationSequence, (step) => {
      const nextState = step?.board ? { ...state, board: step.board } : state

      stateManager.updateFromServer(nextState, shouldApplyMoveOrigin ? { moveOrigin } : {})
      shouldApplyMoveOrigin = false

      gameBoard.flashExplosion(step.row, step.col)
      gameBoard.flashTransfer(step.row, step.col)
    })
  })

  animationQueue.setOnIdle(() => {
    if (pendingFinalAnimationState) {
      stateManager.updateFromServer(pendingFinalAnimationState)
      pendingFinalAnimationState = null
      return
    }

    const localState = stateManager.getState()
    if (localState) {
      stateManager.updateFromServer(localState)
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

  socket.on('error:game:notAllowed', ({ message }) => {
    gameNotice.textContent = message || 'Acción no permitida'
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

  revealCountersButton?.addEventListener('click', () => {
    socket.emit('client:game:revealAtomCounters')
  })

  openSettingsButton?.addEventListener('click', () => {
    setSettingsPanelOpen(!isSettingsPanelOpen)
  })

  closeSettingsButton?.addEventListener('click', () => {
    setSettingsPanelOpen(false)
  })

  animationDelayControl?.addEventListener('change', () => {
    const state = stateManager.getState()
    if (!state || state.state !== 'ACTIVE') {
      return
    }

    const animationDelayMs = clampValue(
      animationDelayControl.value,
      MIN_ANIMATION_DELAY_MS,
      MAX_ANIMATION_DELAY_MS,
      DEFAULT_ANIMATION_DELAY,
      ANIMATION_DELAY_STEP_MS
    )

    animationDelayControl.value = String(animationDelayMs)
    if (animationDelayValue) {
      animationDelayValue.textContent = String(animationDelayMs)
    }
    emitTimingUpdate({ animationDelayMs })
  })

  machineDelayControl?.addEventListener('change', () => {
    const state = stateManager.getState()
    if (!state || state.state !== 'ACTIVE') {
      return
    }

    const machineResponseDelayMs = clampValue(
      machineDelayControl.value,
      MIN_MACHINE_RESPONSE_DELAY_MS,
      MAX_MACHINE_RESPONSE_DELAY_MS,
      DEFAULT_MACHINE_RESPONSE_DELAY_MS,
      MACHINE_RESPONSE_DELAY_STEP_MS
    )

    machineDelayControl.value = String(machineResponseDelayMs)
    if (machineDelayValue) {
      machineDelayValue.textContent = String(machineResponseDelayMs)
    }
    emitTimingUpdate({ machineResponseDelayMs })
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
