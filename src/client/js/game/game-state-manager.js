/**
 * Store and sync local/authoritative game state on client.
 * @returns {{updateFromServer:function,applyOptimisticMove:function,revertOptimisticMove:function,subscribe:function,getState:function}}
 */
export function createGameStateManager () {
  let serverState = null
  let optimisticSnapshot = null
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

  function updateFromServer (nextState) {
    serverState = cloneState(nextState)
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
