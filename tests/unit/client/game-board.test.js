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

  contains (name) {
    return this.classes.has(name)
  }

  setFromString (value = '') {
    this.classes = new Set(value.split(/\s+/).filter(Boolean))
    this.owner.syncClassName()
  }
}

class FakeElement {
  constructor (tagName) {
    this.tagName = tagName
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
    this.type = ''
    this._innerHTML = ''
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

describe('game-board', () => {
  let createGameBoard

  beforeAll(async () => {
    const moduleUrl = pathToFileURL(path.resolve(__dirname, '../../../src/client/js/game/game-board.js')).href
    ;({ createGameBoard } = await import(moduleUrl))
  })

  beforeEach(() => {
    global.document = {
      createElement: (tagName) => new FakeElement(tagName)
    }
  })

  afterEach(() => {
    delete global.document
  })

  function buildState (lastMoveCellId) {
    return {
      board: {
        size: 2,
        cells: [
          [
            { player: 1, atoms: 1 },
            { player: null, atoms: 0 }
          ],
          [
            { player: null, atoms: 0 },
            { player: 2, atoms: 1 }
          ]
        ]
      },
      lastMoveCellId
    }
  }

  function getHighlightedCells (container) {
    return container.children.filter((child) => child.classList.contains('is-last-move'))
  }

  test('highlights only the current last-move cell', () => {
    const container = new FakeElement('div')
    const board = createGameBoard(container)

    board.render(buildState('0:0'))

    const highlighted = getHighlightedCells(container)
    expect(highlighted).toHaveLength(1)
    expect(highlighted[0].dataset.row).toBe('0')
    expect(highlighted[0].dataset.col).toBe('0')
  })

  test('replaces previous highlight when last move changes', () => {
    const container = new FakeElement('div')
    const board = createGameBoard(container)

    board.render(buildState('0:0'))
    board.render(buildState('1:1'))

    const previous = container.querySelector('.game-cell[data-row="0"][data-col="0"]')
    const current = container.querySelector('.game-cell[data-row="1"][data-col="1"]')

    expect(previous.classList.contains('is-last-move')).toBe(false)
    expect(current.classList.contains('is-last-move')).toBe(true)
    expect(getHighlightedCells(container)).toHaveLength(1)
  })
})
