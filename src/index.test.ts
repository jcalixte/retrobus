import {
  addEventBusListener,
  clearEventBusListeners,
  createEventBus,
  emit,
  removeEventBusListener
} from './index'

describe('event bus', () => {
  beforeEach(() => {
    clearEventBusListeners()
  })

  it('calls a callback listener', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    addEventBusListener('on-test-callback-listener', callback1)
    addEventBusListener('on-test-callback-listener', callback2)

    emit('on-test-callback-listener')

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('calls a callback listener with a symbol', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const eventName = Symbol('on-test-callback-listener')

    addEventBusListener(eventName, callback1)
    addEventBusListener(eventName, callback2)

    emit(eventName)

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('calls a callback listener distinguished by symbols', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    const eventName1 = Symbol()
    const eventName2 = Symbol()

    addEventBusListener(eventName1, callback1)
    addEventBusListener(eventName2, callback2)

    emit(eventName1)

    expect(callback1).toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })

  it('calls a callback listener with args', () => {
    const callback = jest.fn()
    const args = [1, 'test', true]
    addEventBusListener('on-test-callback-listener-with-args', callback)
    emit('on-test-callback-listener-with-args', ...args)

    expect(callback).toHaveBeenCalledWith(...args)
  })

  it("doesn't call a callback if the listener is added too late", () => {
    const callback = jest.fn()

    emit('on-test-too-late')

    addEventBusListener('on-test-too-late', callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('calls a callback retroactively if the listener is added too late', () => {
    const callback = jest.fn()

    emit('on-test-retro-too-late', 1234567)

    addEventBusListener('on-test-retro-too-late', callback, {
      retro: true
    })

    expect(callback).toHaveBeenCalledWith(1234567)
  })

  it('calls a callback retroactively if the listener is added too late without args', () => {
    const callback = jest.fn()

    emit('on-test-retro-too-late-without-args')

    addEventBusListener('on-test-retro-too-late-without-args', callback, {
      retro: true
    })

    expect(callback).toHaveBeenCalledWith()
  })

  it('calls a callback multiple times', () => {
    const callback = jest.fn()

    emit('on-test-multiple-times')

    addEventBusListener('on-test-multiple-times', callback, {
      retro: true
    })

    emit('on-test-multiple-times')
    emit('on-test-multiple-times')

    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('calls a one time callback only once', () => {
    const callback = jest.fn()

    addEventBusListener('on-test-once', callback, {
      once: true
    })

    emit('on-test-once')
    emit('on-test-once')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls a one time callback retroactively only once', () => {
    const callback = jest.fn()

    emit('on-test-retro-once')

    addEventBusListener('on-test-retro-once', callback, {
      once: true,
      retro: true
    })

    emit('on-test-retro-once')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does nothing when removing before adding', () => {
    const callback = jest.fn()
    removeEventBusListener('on-test-remove-before-add', callback)

    addEventBusListener('on-test-remove-before-add', callback)

    emit('on-test-remove-before-add')
    removeEventBusListener('on-test-remove-before-add', callback)

    emit('on-test-remove-before-add')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('removes the listening callback', () => {
    const callback = jest.fn()

    addEventBusListener('on-test-remove-callback', callback)

    emit('on-test-remove-callback')
    removeEventBusListener('on-test-remove-callback', callback)

    emit('on-test-remove-callback')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('clears listeners', () => {
    const callback = jest.fn()

    addEventBusListener('on-test-clear-listeners', callback)

    clearEventBusListeners('on-test-clear-listeners')

    emit('on-test-clear-listeners')

    expect(callback).not.toHaveBeenCalled()
  })

  it('clears everything', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()

    addEventBusListener('on-test-1', callback1)
    addEventBusListener('on-test-2', callback2)

    clearEventBusListeners()

    emit('on-test-1')
    emit('on-test-2')

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })

  it('removes event bus on call the return callback', () => {
    const callback = jest.fn()

    const unsubscribe = addEventBusListener(
      'on-test-remove-with-callback',
      callback
    )

    emit('on-test-remove-with-callback')
    unsubscribe()
    emit('on-test-remove-with-callback')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls only once a unique callback', () => {
    const callback = jest.fn()

    addEventBusListener('on-test-unique', callback, { unique: true })
    addEventBusListener('on-test-unique', callback, { unique: true })

    emit('on-test-unique')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls every event emitted from the beginning with retroStrategy to "all"', () => {
    const callback = jest.fn()

    emit('on-test-retro-strategy-all')
    emit('on-test-retro-strategy-all', { first: true })
    emit('on-test-retro-strategy-all', { second: true })

    addEventBusListener('on-test-retro-strategy-all', callback, {
      retro: true,
      retroStrategy: 'all'
    })

    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith()
    expect(callback).toHaveBeenCalledWith({
      first: true
    })
    expect(callback).toHaveBeenCalledWith({
      second: true
    })
  })

  it('creates an eventBus who links emit and listeners', () => {
    const callback = jest.fn()
    const eventBus = createEventBus<boolean>('create-event-bus')

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('creates an eventBus who links emit and listeners with no event name', () => {
    const callback = jest.fn()
    const eventBus = createEventBus<boolean>()

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('creates an eventBus who links emit and listeners with a symbol', () => {
    const callback = jest.fn()
    const eventBus = createEventBus<boolean>()

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('creates an eventBus who links emit and listeners with a unique symbol', () => {
    const callback = jest.fn()
    const eventBus = createEventBus<boolean>()
    const eventBusCopy = createEventBus<boolean>()

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)
    eventBusCopy.emit(true)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('creates an eventBus and clears listeners', () => {
    const callback = jest.fn()
    const eventBus = createEventBus<boolean>('create-event-bus-clear')

    eventBus.addEventBusListener(callback)

    eventBus.clearEventBusListeners()

    eventBus.emit(true)

    expect(callback).not.toHaveBeenCalled()
  })
})
