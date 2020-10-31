type Callback = (...args: any[]) => void

interface Options {
  /**
   * Call retroactively the callback if the event
   * was emitted before the listener
   */
  retro?: boolean
  /**
   * Remove the callback right after being called.
   * If `retro` is true and if the event was
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

const emittedEvents: Map<string, any[]> = new Map()
const eventListeners: Map<string, Params[]> = new Map()

const defaultOptions: Options = {
  retro: false,
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
    const args = emittedEvents.get(name) as any[]
    callback(...args)

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
export const emit = (name: string, ...args: any[]) => {
  const listeners = eventListeners.get(name)

  if (!listeners) {
    return
  }

  listeners.map((call) => call.callback(...args))
  emittedEvents.set(name, args)
  eventListeners.set(
    name,
    listeners.filter((call) => !call.once)
  )
}
