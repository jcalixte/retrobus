type Callback = (...args: any[]) => void

const CACHE_EMITTED_EVENT_LIMIT = 1000

interface Options {
  /**
   * Call retroactively the callback if the event
   * was emitted before the listener
   */
  retro?: boolean
  /**
   * Define the strategy when calling previous emitted
   * events.
   * If `retroStrategy` is set to `all`, every emitted
   * events will be called, from oldest to newest.
   * If `retroStrategy` is set to `last-one`, only the
   * last emitted event will be retractively called.
   * Default to `last-one`.
   * Ignored if `retro` is `false`.
   */
  retroStrategy?: 'last-one' | 'all'
  /**
   * Remove the callback right after being called.
   * If `retro` is `true` and if the event was
   * previously emitted, the callback is directly
   * called then removed.
   */
  once?: boolean
  /**
   * Make sure the callback is only added once.
   */
  unique?: boolean
}

interface Params extends Options {
  callback: Callback
}

const emittedEvents: Map<string | symbol, any[][]> = new Map()
const eventListeners: Map<string | symbol, Params[]> = new Map()

const defaultOptions: Options = {
  retro: false,
  retroStrategy: 'last-one',
  once: false,
  unique: false
}

/**
 * Add a listener to a specific event.
 * @param name name of the event
 * @param callback the method who will be called when the event is emitted.
 * @param options option parameters to change callback behavior
 */
export const addEventBusListener = (
  name: string | symbol,
  callback: Callback,
  options: Options = {}
): (() => void) => {
  const opts = { ...defaultOptions, ...options }
  const unsubscribe = () => removeEventBusListener(name, callback)
  const listeners = eventListeners.get(name)

  if (opts.retro && emittedEvents.has(name)) {
    const emittedEventArgs = emittedEvents.get(name)!
    switch (opts.retroStrategy) {
      case 'all': {
        for (const args of emittedEventArgs) {
          callback(...args)
        }
        break
      }
      case 'last-one':
      default: {
        const args = emittedEventArgs[emittedEventArgs.length - 1]

        callback(...args)
        break
      }
    }

    if (opts.once) {
      return unsubscribe
    }
  }

  const listener = { callback, ...opts }

  if (!listeners) {
    eventListeners.set(name, [listener])
    return unsubscribe
  }

  if (opts.unique && listeners.find((c) => c.callback === callback)) {
    return unsubscribe
  }

  eventListeners.set(name, listeners.concat([listener]))

  return unsubscribe
}

/**
 * Remove a callback to be called when event is emitted.
 * @param name name of the event.
 * @param callback callback you don't want anymore to trigger when event is emitted.
 */
export const removeEventBusListener = (
  name: string | symbol,
  callback: Callback
) => {
  const calls = eventListeners.get(name)

  if (!calls) {
    return
  }

  eventListeners.set(
    name,
    calls.filter((call) => call.callback !== callback)
  )
}

/**
 * Clear all listeners from an event.
 * @param name event name to clear all its listeners.
 */
export const clearEventBusListeners = (name?: string | symbol) => {
  if (name === undefined) {
    eventListeners.clear()
    return
  }
  eventListeners.delete(name)
}

/**
 * Limit the array of emitted events we want to cache
 * @param emittedEventArgs emitted event arguments we want to limit
 * @returns array of limited emitted event arguments
 */
const getLimitedHistoryOfEmittedEventArgs = <T>(
  emittedEventArgs: T[][]
): T[][] => {
  if (emittedEventArgs.length > CACHE_EMITTED_EVENT_LIMIT) {
    return [...emittedEventArgs.slice(-CACHE_EMITTED_EVENT_LIMIT)]
  }

  return emittedEventArgs
}

/**
 * Emit an event.
 * @param name name of the event to emit.
 * @param args arguments to be passed to all listeners.
 */
export const emit = <T extends any>(name: string | symbol, ...args: T[]) => {
  const listeners = eventListeners.get(name)

  if (emittedEvents.has(name)) {
    const emittedEventArgs = emittedEvents.get(name)!
    emittedEvents.set(
      name,
      getLimitedHistoryOfEmittedEventArgs(emittedEventArgs.concat([args]))
    )
  } else {
    emittedEvents.set(name, [args])
  }

  if (!listeners) {
    return
  }

  listeners.forEach((call) => {
    try {
      call.callback(...args)
    } catch (error) {
      console.error(error)
    }
  })
  eventListeners.set(
    name,
    listeners.filter((call) => !call.once)
  )
}

/**
 * Clear all emitted events.
 * @param name event name.
 */
export const clearEmittedEvents = (name?: string | symbol) => {
  if (name === undefined) {
    emittedEvents.clear()
    return
  }

  emittedEvents.delete(name)
}

/**
 * Create an event bus to type listeners' payload
 * as the same as emit method's payload.
 * @param event event name
 */
export const createEventBus = <T>(event: string | symbol = Symbol()) => {
  return {
    emit: (payload: T) => emit<T>(event, payload),
    clearEmittedEvents: () => clearEmittedEvents(event),
    addEventBusListener: (callback: (payload: T) => void, options?: Options) =>
      addEventBusListener(event, callback, options),
    removeEventBusListener: (callback: (payload: T) => void) =>
      removeEventBusListener(event, callback),
    clearEventBusListeners: () => clearEventBusListeners(event)
  }
}
