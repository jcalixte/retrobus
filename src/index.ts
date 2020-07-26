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
    const args = emittedEvents.get(name)
    callback(...(args ?? []))

    if (options.once) {
      return
    }
  }

  const params = { callback, ...options }

  if (!calls) {
    callbacks.set(name, [params])
  } else {
    callbacks.set(name, [...calls, params])
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

export const emit = (name: string, ...args: unknown[]) => {
  const calls = callbacks.get(name)

  if (!calls) {
    return
  }

  calls.map((call) => call.callback(...args))
  emittedEvents.set(name, args || [])
  callbacks.set(
    name,
    calls.filter((call) => !call.once)
  )
}
