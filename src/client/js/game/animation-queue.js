import { DEFAULT_ANIMATION_DELAY } from './constants.js'

/**
 * Ordered client animation queue for chain-reaction effects.
 * @returns {{enqueue:function,playExplosionSequence:function,setOnIdle:function}}
 */
export function createAnimationQueue () {
  const queue = []
  let running = false
  let onIdle = null

  function prefersReducedMotion () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function runNext () {
    if (running) {
      return
    }

    if (queue.length === 0) {
      onIdle?.()
      return
    }

    running = true
    const step = queue.shift()
    const delay = prefersReducedMotion() ? 0 : (step.delay ?? DEFAULT_ANIMATION_DELAY)

    window.setTimeout(() => {
      step.run()
      running = false
      runNext()
    }, delay)
  }

  function enqueue (run, delay) {
    queue.push({ run, delay })
    runNext()
  }

  function playExplosionSequence (steps, onExplosion) {
    steps.forEach((step) => {
      enqueue(() => {
        onExplosion(step)
      }, step.delay)
    })
  }

  function setOnIdle (callback) {
    onIdle = callback
  }

  return {
    enqueue,
    playExplosionSequence,
    setOnIdle
  }
}
