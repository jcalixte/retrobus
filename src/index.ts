type Callback = (...args: any[]) => void

interface Options {
  retro?: boolean
  once?: boolean
  unique?: boolean
}

interface Params extends Options {
  callback: Callback
}

const emittedEvents: Map<string, any[]> = new Map()
const callbacks: Map<string, Params[]> = new Map()

const defaultOptions: Options = {
  retro: false,
  once: false,
  unique: false
}

export const addEventBusListener = (
  name: string,
  callback: Callback,
  options: Options = defaultOptions
): (() => void) => {
  const unsubscribe = () => removeEventBusListener(name, callback)
  const calls = callbacks.get(name)

  if (options.retro && emittedEvents.has(name)) {
    const args = emittedEvents.get(name) as any[]
    callback(...args)

    if (options.once) {
      return unsubscribe
    }
  }

  const newCallback = { callback, ...options }

  if (!calls) {
    callbacks.set(name, [newCallback])
    return unsubscribe
  }

  if (options.unique && calls.find((c) => c.callback === callback)) {
    return unsubscribe
  }

  callbacks.set(name, [...calls, newCallback])

  return unsubscribe
}

export const removeEventBusListener = (name: string, callback: Callback) => {
  const calls = callbacks.get(name)

  if (!calls) {
    return
  }

  callbacks.set(
    name,
    calls.filter((call) => call.callback !== callback)
  )
}

export const clearEventBusListeners = (name?: string) => {
  if (name === undefined) {
    callbacks.clear()
    return
  }
  callbacks.delete(name)
}

export const emit = (name: string, ...args: any[]) => {
  const calls = callbacks.get(name)

  if (!calls) {
    return
  }

  calls.map((call) => call.callback(...args))
  emittedEvents.set(name, args)
  callbacks.set(
    name,
    calls.filter((call) => !call.once)
  )
}
