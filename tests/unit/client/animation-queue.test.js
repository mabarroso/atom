const path = require('path')
const { pathToFileURL } = require('url')

describe('animation-queue', () => {
  let createAnimationQueue

  beforeAll(async () => {
    const moduleUrl = pathToFileURL(path.resolve(__dirname, '../../../src/client/js/game/animation-queue.js')).href
    ;({ createAnimationQueue } = await import(moduleUrl))
  })

  beforeEach(() => {
    jest.useFakeTimers()
    global.window = {
      setTimeout,
      matchMedia: jest.fn(() => ({ matches: false }))
    }
  })

  afterEach(() => {
    jest.useRealTimers()
    delete global.window
  })

  test('processes queued callbacks sequentially', () => {
    const queue = createAnimationQueue()
    const order = []

    queue.enqueue(() => order.push('first'), 20)
    queue.enqueue(() => order.push('second'), 20)

    expect(order).toEqual([])
    jest.advanceTimersByTime(20)
    expect(order).toEqual(['first'])
    jest.advanceTimersByTime(20)
    expect(order).toEqual(['first', 'second'])
  })

  test('uses zero delay when prefers-reduced-motion is enabled', () => {
    window.matchMedia.mockReturnValue({ matches: true })
    const queue = createAnimationQueue()
    const run = jest.fn()

    queue.enqueue(run, 500)
    jest.runOnlyPendingTimers()

    expect(run).toHaveBeenCalledTimes(1)
  })

  test('plays explosion sequence in order and invokes idle callback', () => {
    const queue = createAnimationQueue()
    const played = []
    const onIdle = jest.fn()

    queue.setOnIdle(onIdle)
    queue.playExplosionSequence(
      [
        { row: 0, col: 0, delay: 10 },
        { row: 0, col: 1, delay: 10 }
      ],
      (step) => {
        played.push(`${step.row}:${step.col}`)
      }
    )

    jest.advanceTimersByTime(10)
    expect(played).toEqual(['0:0'])
    jest.advanceTimersByTime(10)
    expect(played).toEqual(['0:0', '0:1'])
    expect(onIdle).toHaveBeenCalled()
  })
})
