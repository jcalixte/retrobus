type Callback = (...args: unknown[]) => void

interface Options {
  retro?: boolean
  once?: boolean
}

interface Params extends Options {
  callback: Callback
}

const emittedEvents: Map<string, unknown[]> = new Map()
const callbacks: Map<string, Params[]> = new Map()

const defaultOptions: Options = {
  retro: false,
  once: false
}

export const addEventBusListener = (
  name: string,
  callback: Callback,
  options: Options = defaultOptions
) => {
  const calls = callbacks.get(name)

  if (options.retro && emittedEvents.has(name)) {
    const args = emittedEvents.get(name) as unknown[]
    callback(...args)

    if (options.once) {
      return
    }
  }

  const newCallback = { callback, ...options }

  if (!calls) {
    callbacks.set(name, [newCallback])
  } else {
    callbacks.set(name, [...calls, newCallback])
  }
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

export const clearEventBusListener = (name?: string) => {
  if (name === undefined) {
    callbacks.clear()
    return
  }
  callbacks.delete(name)
}

export const emit = (name: string, ...args: unknown[]) => {
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
