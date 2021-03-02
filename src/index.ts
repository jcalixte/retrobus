type Callback = (...args: any[]) => void

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

const emittedEvents: Map<string, any[][]> = new Map()
const eventListeners: Map<string, Params[]> = new Map()

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
  name: string,
  callback: Callback,
  options: Options = defaultOptions
): (() => void) => {
  const unsubscribe = () => removeEventBusListener(name, callback)
  const listeners = eventListeners.get(name)

  if (options.retro && emittedEvents.has(name)) {
    const emittedEventArgs = emittedEvents.get(name)!
    switch (options.retroStrategy) {
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

    if (options.once) {
      return unsubscribe
    }
  }

  const listener = { callback, ...options }

  if (!listeners) {
    eventListeners.set(name, [listener])
    return unsubscribe
  }

  if (options.unique && listeners.find((c) => c.callback === callback)) {
    return unsubscribe
  }

  eventListeners.set(name, [...listeners, listener])

  return unsubscribe
}

/**
 * Remove a callback to be called when event is emitted.
 * @param name name of the event.
 * @param callback callback you don't want anymore to trigger when event is emitted.
 */
export const removeEventBusListener = (name: string, callback: Callback) => {
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
export const clearEventBusListeners = (name?: string) => {
  if (name === undefined) {
    eventListeners.clear()
    return
  }
  eventListeners.delete(name)
}

/**
 * Emit an event.
 * @param name name of the event to emit.
 * @param]} args arguments to be passed to all listeners.
 */
export const emit = <T extends any>(name: string, ...args: T[]) => {
  const listeners = eventListeners.get(name)

  if (emittedEvents.has(name)) {
    const emittedEventArgs = emittedEvents.get(name)!
    emittedEvents.set(name, [...emittedEventArgs, args])
  } else {
    emittedEvents.set(name, [args])
  }

  if (!listeners) {
    return
  }

  listeners.map((call) => call.callback(...args))
  eventListeners.set(
    name,
    listeners.filter((call) => !call.once)
  )
}

/**
 * Create an event bus to type listeners' payload
 * as the same as emit method's payload.
 * @param event event name
 */
export const createEventBus = <T>(event: string) => {
  return {
    emit: (payload: T) => emit<T>(event, payload),
    addEventBusListener: (callback: (payload: T) => void, options?: Options) =>
      addEventBusListener(event, callback, options),
    clearEventBusListeners: () => clearEventBusListeners(event)
  }
}
