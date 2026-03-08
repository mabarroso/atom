const { registerSocketHandlers } = require('../../../src/server/socket-handler')

describe('socket handlers', () => {
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
})
