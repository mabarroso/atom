/**
 * Store and sync local/authoritative game state on client.
 * @returns {{updateFromServer:function,applyOptimisticMove:function,revertOptimisticMove:function,subscribe:function,getState:function}}
 */
export function createGameStateManager () {
  let serverState = null
  let optimisticSnapshot = null
  let lastMoveCellId = null
  const listeners = new Set()

  function notify () {
    listeners.forEach((listener) => listener(serverState))
  }

  function cloneState (state) {
    return state ? JSON.parse(JSON.stringify(state)) : null
  }

  function getMachineMode () {
    return Boolean(serverState?.machineMode)
  }

  function toCellId (moveOrigin) {
    if (!moveOrigin || !Number.isInteger(moveOrigin.row) || !Number.isInteger(moveOrigin.col)) {
      return null
    }

    return `${moveOrigin.row}:${moveOrigin.col}`
  }

  function updateFromServer (nextState, options = {}) {
    if (options.resetLastMove === true) {
      lastMoveCellId = null
    }

    if (options.moveOrigin) {
      const nextLastMoveCellId = toCellId(options.moveOrigin)
      if (nextLastMoveCellId) {
        lastMoveCellId = nextLastMoveCellId
      }
    }

    serverState = cloneState(nextState)
    if (serverState) {
      if (!Number.isInteger(serverState.turnNumber) && Number.isInteger(serverState.turn)) {
        serverState.turnNumber = serverState.turn
      }

      if (!Number.isInteger(serverState.turn) && Number.isInteger(serverState.turnNumber)) {
        serverState.turn = serverState.turnNumber
      }

      serverState.lastMoveCellId = lastMoveCellId
    }
    optimisticSnapshot = null
    notify()
  }

  function applyOptimisticMove (row, col, player) {
    if (!serverState) {
      return
    }

    optimisticSnapshot = cloneState(serverState)
    const cell = serverState.board.cells[row][col]
    cell.atoms += 1
    cell.player = player
    notify()
  }

  function revertOptimisticMove () {
    if (!optimisticSnapshot) {
      return
    }

    serverState = optimisticSnapshot
    optimisticSnapshot = null
    notify()
  }

  function subscribe (listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function getState () {
    return serverState
  }

  return {
    updateFromServer,
    applyOptimisticMove,
    revertOptimisticMove,
    subscribe,
    getState,
    getMachineMode
  }
}
