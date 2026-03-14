const { registerSocketHandlers } = require('../../../src/server/socket-handler')
const { games, removeGame, getGame } = require('../../../src/server/game/game-engine')

describe('socket handlers', () => {
  afterEach(() => {
    for (const gameId of games.keys()) {
      removeGame(gameId)
    }
  })

  it('Socket connection is tracked', () => {
    const callbacks = {}
    const io = {
      on: jest.fn((event, callback) => {
        callbacks[event] = callback
      }),
      emit: jest.fn(),
      engine: { clientsCount: 1 }
    }
    const socket = {
      id: 'abc123',
      on: jest.fn(),
      emit: jest.fn()
    }

    registerSocketHandlers(io)
    callbacks.connection(socket)

    expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function))
    expect(io.emit).toHaveBeenCalledWith('server:statusUpdate', { online: 1 })
  })

  it('Socket disconnection is handled', () => {
    const callbacks = {}
    const io = {
      on: jest.fn((event, callback) => {
        callbacks[event] = callback
      }),
      emit: jest.fn(),
      engine: { clientsCount: 3 }
    }
    const socketEvents = {}
    const socket = {
      id: 'abc123',
      on: jest.fn((event, callback) => {
        socketEvents[event] = callback
      }),
      emit: jest.fn()
    }

    registerSocketHandlers(io)
    callbacks.connection(socket)
    socketEvents.disconnect('client namespace disconnect')

    expect(socket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
    expect(io.emit).toHaveBeenCalledWith('server:statusUpdate', { online: 3 })
  })

  it('Player 2 cannot reveal atom counters', () => {
    const callbacks = {}
    const roomEmit = jest.fn()
    const io = {
      on: jest.fn((event, callback) => {
        callbacks[event] = callback
      }),
      emit: jest.fn(),
      to: jest.fn(() => ({ emit: roomEmit })),
      engine: { clientsCount: 2 }
    }

    const socketOneEvents = {}
    const socketTwoEvents = {}
    const socketOne = {
      id: 'socket-1',
      on: jest.fn((event, callback) => {
        socketOneEvents[event] = callback
      }),
      emit: jest.fn(),
      join: jest.fn()
    }
    const socketTwo = {
      id: 'socket-2',
      on: jest.fn((event, callback) => {
        socketTwoEvents[event] = callback
      }),
      emit: jest.fn(),
      join: jest.fn()
    }

    registerSocketHandlers(io)
    callbacks.connection(socketOne)
    callbacks.connection(socketTwo)

    socketOneEvents['client:game:start']({ boardSize: 6 })

    const startCall = roomEmit.mock.calls.find(([eventName]) => eventName === 'server:game:started')
    const startedPayload = startCall?.[1]
    const gameId = startedPayload.gameId

    socketTwoEvents['client:game:start']({ boardSize: 6, gameId })
    socketTwo.emit.mockClear()

    socketTwoEvents['client:game:revealAtomCounters']()

    expect(socketTwo.emit).toHaveBeenCalledWith('error:game:notAllowed', {
      message: 'Solo Jugador 1 puede revelar contadores'
    })
  })

  it('Timing updates are accepted and synchronized to room state', () => {
    const callbacks = {}
    const roomEmit = jest.fn()
    const io = {
      on: jest.fn((event, callback) => {
        callbacks[event] = callback
      }),
      emit: jest.fn(),
      to: jest.fn(() => ({ emit: roomEmit })),
      engine: { clientsCount: 2 }
    }

    const socketOneEvents = {}
    const socketTwoEvents = {}
    const socketOne = {
      id: 'socket-1',
      on: jest.fn((event, callback) => {
        socketOneEvents[event] = callback
      }),
      emit: jest.fn(),
      join: jest.fn()
    }
    const socketTwo = {
      id: 'socket-2',
      on: jest.fn((event, callback) => {
        socketTwoEvents[event] = callback
      }),
      emit: jest.fn(),
      join: jest.fn()
    }

    registerSocketHandlers(io)
    callbacks.connection(socketOne)
    callbacks.connection(socketTwo)

    socketOneEvents['client:game:start']({ boardSize: 6 })

    const startCall = roomEmit.mock.calls.find(([eventName]) => eventName === 'server:game:started')
    const gameId = startCall?.[1]?.gameId

    socketTwoEvents['client:game:start']({ boardSize: 6, gameId })
    roomEmit.mockClear()

    socketOneEvents['client:game:updateTiming']({
      animationDelayMs: 150,
      machineResponseDelayMs: 0
    })

    const stateUpdateCall = roomEmit.mock.calls.find(([eventName]) => eventName === 'server:game:stateUpdate')
    expect(stateUpdateCall).toBeDefined()
    expect(stateUpdateCall[1].state.animationDelayMs).toBe(200)
    expect(stateUpdateCall[1].state.machineResponseDelayMs).toBe(0)
  })

  it('delays turnChanged until cascade completion window finishes', () => {
    jest.useFakeTimers()

    const callbacks = {}
    const roomEmit = jest.fn()
    const io = {
      on: jest.fn((event, callback) => {
        callbacks[event] = callback
      }),
      emit: jest.fn(),
      to: jest.fn(() => ({ emit: roomEmit })),
      engine: { clientsCount: 2 }
    }

    const socketOneEvents = {}
    const socketTwoEvents = {}
    const socketOne = {
      id: 'socket-1',
      on: jest.fn((event, callback) => {
        socketOneEvents[event] = callback
      }),
      emit: jest.fn(),
      join: jest.fn()
    }
    const socketTwo = {
      id: 'socket-2',
      on: jest.fn((event, callback) => {
        socketTwoEvents[event] = callback
      }),
      emit: jest.fn(),
      join: jest.fn()
    }

    registerSocketHandlers(io)
    callbacks.connection(socketOne)
    callbacks.connection(socketTwo)

    socketOneEvents['client:game:start']({ boardSize: 6 })

    const startCall = roomEmit.mock.calls.find(([eventName]) => eventName === 'server:game:started')
    const gameId = startCall?.[1]?.gameId

    socketTwoEvents['client:game:start']({ boardSize: 6, gameId })

    const game = getGame(gameId)
    game.board.placeAtom(1, 1, 1)
    game.board.placeAtom(1, 1, 1)
    game.board.placeAtom(1, 1, 1)

    roomEmit.mockClear()
    socketOneEvents['client:game:move']({ row: 1, col: 1 })

    const immediateTurnEvents = roomEmit.mock.calls.filter(([eventName]) => eventName === 'server:game:turnChanged')
    expect(immediateTurnEvents).toHaveLength(0)

    jest.runOnlyPendingTimers()

    const delayedTurnEvents = roomEmit.mock.calls.filter(([eventName]) => eventName === 'server:game:turnChanged')
    expect(delayedTurnEvents.length).toBeGreaterThan(0)
    expect(delayedTurnEvents[0][1].currentPlayer).toBe(2)

    jest.useRealTimers()
  })
})
