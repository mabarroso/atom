const path = require('path')
const { pathToFileURL } = require('url')

class FakeClassList {
  constructor (owner) {
    this.owner = owner
    this.classes = new Set()
  }

  add (...names) {
    names.forEach((name) => {
      if (name) this.classes.add(name)
    })
    this.owner.syncClassName()
  }

  remove (...names) {
    names.forEach((name) => this.classes.delete(name))
    this.owner.syncClassName()
  }

  toggle (name, force) {
    if (force === true) {
      this.classes.add(name)
    } else if (force === false) {
      this.classes.delete(name)
    } else if (this.classes.has(name)) {
      this.classes.delete(name)
    } else {
      this.classes.add(name)
    }
    this.owner.syncClassName()
    return this.classes.has(name)
  }

  contains (name) {
    return this.classes.has(name)
  }

  setFromString (value = '') {
    this.classes = new Set(value.split(/\s+/).filter(Boolean))
    this.owner.syncClassName()
  }
}

class FakeElement {
  constructor (tagName, id = null) {
    this.tagName = tagName
    this.id = id
    this.children = []
    this.dataset = {}
    this.attributes = {}
    this.eventListeners = {}
    this.styleValues = {}
    this.style = {
      setProperty: (name, value) => {
        this.styleValues[name] = value
      }
    }
    this.classList = new FakeClassList(this)
    this._className = ''
    this._innerHTML = ''
    this.textContent = ''
    this.value = ''
    this.checked = false
    this.disabled = false
    this.type = 'button'
  }

  set className (value) {
    this.classList.setFromString(value)
  }

  get className () {
    return this._className
  }

  syncClassName () {
    this._className = Array.from(this.classList.classes).join(' ')
  }

  set innerHTML (value) {
    this._innerHTML = value
    if (value === '') {
      this.children = []
    }
  }

  get innerHTML () {
    return this._innerHTML
  }

  setAttribute (name, value) {
    this.attributes[name] = String(value)
  }

  getAttribute (name) {
    return this.attributes[name] || null
  }

  appendChild (child) {
    this.children.push(child)
    return child
  }

  addEventListener (eventName, handler) {
    this.eventListeners[eventName] = handler
  }

  querySelector (selector) {
    const match = /\.game-cell\[data-row="(\d+)"\]\[data-col="(\d+)"\]/.exec(selector)
    if (!match) {
      return null
    }

    const row = match[1]
    const col = match[2]
    return this.children.find((child) => {
      return child.classList?.contains('game-cell') && child.dataset.row === row && child.dataset.col === col
    }) || null
  }
}

function createState (board) {
  return {
    state: 'ACTIVE',
    roomId: 'room-1',
    roundNumber: 1,
    currentPlayer: 1,
    machineMode: false,
    atomCountersVisible: false,
    atomCounters: { player1: 0, player2: 0, total: 0 },
    animationDelayMs: 300,
    machineResponseDelayMs: 100,
    players: {
      1: { id: 1, name: 'Jugador 1', connected: true, socketId: 'socket-1' },
      2: { id: 2, name: 'Jugador 2', connected: true, socketId: 'socket-2' }
    },
    board
  }
}

function createBoard (size = 4) {
  return {
    size,
    cells: Array.from({ length: size }, () => {
      return Array.from({ length: size }, () => ({ player: null, atoms: 0 }))
    })
  }
}

function createSocketMock () {
  const listeners = new Map()

  return {
    id: 'socket-1',
    emitted: [],
    on (eventName, handler) {
      const existing = listeners.get(eventName) || []
      existing.push(handler)
      listeners.set(eventName, existing)
    },
    emit (eventName, payload) {
      this.emitted.push({ eventName, payload })
    },
    trigger (eventName, payload) {
      const handlers = listeners.get(eventName) || []
      handlers.forEach((handler) => handler(payload))
    }
  }
}

function buildRequiredDom () {
  const ids = [
    'game-container',
    'game-board',
    'round-number-indicator',
    'turn-indicator',
    'game-notice',
    'player-1-indicator',
    'player-2-indicator',
    'btn-new-game',
    'btn-restart-game',
    'btn-open-settings',
    'btn-close-settings',
    'settings-panel',
    'btn-reveal-counters',
    'btn-join-game',
    'join-game-id',
    'board-size',
    'game-mode-human',
    'game-mode-machine',
    'game-id-value',
    'animation-delay-control',
    'machine-delay-control',
    'animation-delay-value',
    'machine-delay-value',
    'atom-counters-panel',
    'atom-counter-player-1',
    'atom-counter-player-2',
    'atom-counter-total'
  ]

  const elements = new Map()
  ids.forEach((id) => {
    const element = new FakeElement('div', id)
    elements.set(id, element)
  })

  elements.get('game-container').classList.add('d-none')
  elements.get('settings-panel').classList.add('d-none')
  elements.get('atom-counters-panel').classList.add('d-none')
  elements.get('btn-reveal-counters').classList.add('d-none')

  elements.get('btn-new-game').type = 'button'
  elements.get('btn-restart-game').type = 'button'
  elements.get('btn-open-settings').type = 'button'
  elements.get('btn-close-settings').type = 'button'
  elements.get('btn-join-game').type = 'button'
  elements.get('btn-reveal-counters').type = 'button'

  elements.get('board-size').value = '6'
  elements.get('join-game-id').value = ''
  elements.get('game-mode-human').checked = true
  elements.get('game-mode-machine').checked = false
  elements.get('animation-delay-control').value = '300'
  elements.get('machine-delay-control').value = '100'

  const documentMock = {
    getElementById: (id) => elements.get(id) || null,
    createElement: (tagName) => new FakeElement(tagName)
  }

  return { documentMock, elements }
}

describe('game-ui', () => {
  let initGameUI

  beforeAll(async () => {
    const moduleUrl = pathToFileURL(path.resolve(__dirname, '../../../src/client/js/game/game-ui.js')).href
    ;({ initGameUI } = await import(moduleUrl))
  })

  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    delete global.window
    delete global.document
  })

  test('applies each explosion step board snapshot in queue order', () => {
    const { documentMock, elements } = buildRequiredDom()
    const socket = createSocketMock()

    global.document = documentMock
    global.window = {
      setTimeout,
      confirm: jest.fn(() => true),
      matchMedia: jest.fn(() => ({ matches: false }))
    }

    initGameUI(socket)

    const initialBoard = createBoard(4)
    const stepOneBoard = createBoard(4)
    const stepTwoBoard = createBoard(4)

    stepOneBoard.cells[1][1] = { player: 1, atoms: 6 }
    stepOneBoard.cells[1][2] = { player: 1, atoms: 4 }

    stepTwoBoard.cells[1][1] = { player: 1, atoms: 1 }
    stepTwoBoard.cells[1][2] = { player: 1, atoms: 5 }

    socket.trigger('server:game:started', {
      gameId: 'game-1',
      machineMode: false,
      state: createState(initialBoard)
    })

    socket.trigger('server:game:stateUpdate', {
      state: createState(stepTwoBoard),
      moveOrigin: { row: 1, col: 1 },
      animationSequence: [
        { row: 1, col: 1, delay: 0, board: stepOneBoard },
        { row: 1, col: 1, delay: 500, board: stepTwoBoard }
      ]
    })

    jest.advanceTimersByTime(0)

    const boardContainer = elements.get('game-board')
    const cellStepOne = boardContainer.querySelector('.game-cell[data-row="1"][data-col="2"]')
    expect(cellStepOne.classList.contains('player-1')).toBe(true)
    expect(cellStepOne.getAttribute('aria-label')).toContain('4 átomos, Jugador 1')

    jest.advanceTimersByTime(500)

    const cellStepTwo = boardContainer.querySelector('.game-cell[data-row="1"][data-col="2"]')
    expect(cellStepTwo.classList.contains('player-1')).toBe(true)
    expect(cellStepTwo.getAttribute('aria-label')).toContain('5 átomos, Jugador 1')
  })

  test('redraws impacted cell from authoritative state on machineMove event', () => {
    const { documentMock, elements } = buildRequiredDom()
    const socket = createSocketMock()

    global.document = documentMock
    global.window = {
      setTimeout,
      confirm: jest.fn(() => true),
      matchMedia: jest.fn(() => ({ matches: false }))
    }

    initGameUI(socket)

    const initialBoard = createBoard(4)
    const machineBoard = createBoard(4)
    machineBoard.cells[0][1] = { player: 2, atoms: 1 }

    socket.trigger('server:game:started', {
      gameId: 'game-2',
      machineMode: true,
      state: createState(initialBoard)
    })

    socket.trigger('server:game:stateUpdate', {
      state: createState(machineBoard),
      moveOrigin: { row: 0, col: 1 },
      animationSequence: []
    })

    const boardContainer = elements.get('game-board')
    const cellBeforeMachineMove = boardContainer.querySelector('.game-cell[data-row="0"][data-col="1"]')
    expect(cellBeforeMachineMove.classList.contains('player-2')).toBe(true)
    expect(cellBeforeMachineMove.getAttribute('aria-label')).toContain('1 átomo, Jugador 2')

    socket.trigger('server:game:machineMove', {
      row: 0,
      col: 1
    })

    const cellAfterMachineMove = boardContainer.querySelector('.game-cell[data-row="0"][data-col="1"]')
    expect(cellAfterMachineMove).not.toBe(cellBeforeMachineMove)
    expect(cellAfterMachineMove.classList.contains('player-2')).toBe(true)
    expect(cellAfterMachineMove.getAttribute('aria-label')).toContain('1 átomo, Jugador 2')
    expect(cellAfterMachineMove.classList.contains('is-last-move')).toBe(true)
  })
})
