import { describe, beforeEach, it, expect, vi } from 'vitest'

import {
  addEventBusListener,
  clearEmittedEvents,
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
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    addEventBusListener('on-test-callback-listener', callback1)
    addEventBusListener('on-test-callback-listener', callback2)

    emit('on-test-callback-listener')

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('calls a callback listener with a symbol', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const eventName = Symbol('on-test-callback-listener')

    addEventBusListener(eventName, callback1)
    addEventBusListener(eventName, callback2)

    emit(eventName)

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('calls a callback listener distinguished by symbols', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    const eventName1 = Symbol()
    const eventName2 = Symbol()

    addEventBusListener(eventName1, callback1)
    addEventBusListener(eventName2, callback2)

    emit(eventName1)

    expect(callback1).toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })

  it('calls a callback listener with args', () => {
    const callback = vi.fn()
    const args = [1, 'test', true]
    addEventBusListener('on-test-callback-listener-with-args', callback)
    emit('on-test-callback-listener-with-args', ...args)

    expect(callback).toHaveBeenCalledWith(...args)
  })

  it("doesn't call a callback if the listener is added too late", () => {
    const callback = vi.fn()

    emit('on-test-too-late')

    addEventBusListener('on-test-too-late', callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('calls a callback retroactively if the listener is added too late', () => {
    const callback = vi.fn()

    emit('on-test-retro-too-late', 1234567)

    addEventBusListener('on-test-retro-too-late', callback, {
      retro: true
    })

    expect(callback).toHaveBeenCalledWith(1234567)
  })

  it('calls a callback retroactively if the listener is added too late without args', () => {
    const callback = vi.fn()

    emit('on-test-retro-too-late-without-args')

    addEventBusListener('on-test-retro-too-late-without-args', callback, {
      retro: true
    })

    expect(callback).toHaveBeenCalledWith()
  })

  it('calls a callback multiple times', () => {
    const callback = vi.fn()

    emit('on-test-multiple-times')

    addEventBusListener('on-test-multiple-times', callback, {
      retro: true
    })

    emit('on-test-multiple-times')
    emit('on-test-multiple-times')

    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('calls a one time callback only once', () => {
    const callback = vi.fn()

    addEventBusListener('on-test-once', callback, {
      once: true
    })

    emit('on-test-once')
    emit('on-test-once')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls a one time callback retroactively only once', () => {
    const callback = vi.fn()

    emit('on-test-retro-once')

    addEventBusListener('on-test-retro-once', callback, {
      once: true,
      retro: true
    })

    emit('on-test-retro-once')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does nothing when removing before adding', () => {
    const callback = vi.fn()
    removeEventBusListener('on-test-remove-before-add', callback)

    addEventBusListener('on-test-remove-before-add', callback)

    emit('on-test-remove-before-add')
    removeEventBusListener('on-test-remove-before-add', callback)

    emit('on-test-remove-before-add')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('removes the listening callback', () => {
    const callback = vi.fn()

    addEventBusListener('on-test-remove-callback', callback)

    emit('on-test-remove-callback')
    removeEventBusListener('on-test-remove-callback', callback)

    emit('on-test-remove-callback')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('clears listeners', () => {
    const callback = vi.fn()

    addEventBusListener('on-test-clear-listeners', callback)

    clearEventBusListeners('on-test-clear-listeners')

    emit('on-test-clear-listeners')

    expect(callback).not.toHaveBeenCalled()
  })

  it('clears everything', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    addEventBusListener('on-test-1', callback1)
    addEventBusListener('on-test-2', callback2)

    clearEventBusListeners()

    emit('on-test-1')
    emit('on-test-2')

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })

  it('removes event bus on call the return callback', () => {
    const callback = vi.fn()

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
    const callback = vi.fn()

    addEventBusListener('on-test-unique', callback, { unique: true })
    addEventBusListener('on-test-unique', callback, { unique: true })

    emit('on-test-unique')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls every emitted event from the beginning with retroStrategy to "all"', () => {
    const callback = vi.fn()

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

  it('calls last emitted event with retroStrategy to "last-one"', () => {
    const callback = vi.fn()

    emit('on-test-retro-strategy-last-one')
    emit('on-test-retro-strategy-last-one', { first: true })
    emit('on-test-retro-strategy-last-one', { last: true })

    addEventBusListener('on-test-retro-strategy-last-one', callback, {
      retro: true,
      retroStrategy: 'last-one'
    })

    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith({ last: true })
  })

  it('clears emitted events', () => {
    const callback = vi.fn()

    emit('event to be cleared')

    clearEmittedEvents('event to be cleared')

    addEventBusListener('event to be cleared', callback, {
      retro: true
    })

    expect(callback).toHaveBeenCalledTimes(0)
  })

  it('clears all emitted events', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    emit('event 1')
    emit('event 2')

    clearEmittedEvents()

    addEventBusListener('event 1', callback1, {
      retro: true
    })

    addEventBusListener('event 2', callback2, {
      retro: true
    })

    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()

    emit('event 1')
    emit('event 2')

    expect(callback1).toHaveBeenCalledOnce()
    expect(callback2).toHaveBeenCalledOnce()
  })

  it('is limited to 1000 call history per event; removing the first ones', () => {
    const callback = vi.fn()

    const limit = 1000
    const offset = 10

    for (let i = 0; i < limit + offset; i++) {
      emit('call-history-limit', i)
    }

    addEventBusListener('call-history-limit', callback, {
      retro: true,
      retroStrategy: 'all'
    })

    expect(callback).toHaveBeenCalledTimes(limit)

    for (let i = 0; i < limit; i++) {
      expect(callback).toHaveBeenCalledWith(i + offset)
    }
  })
})

describe('with `create event bus`', () => {
  it('creates an eventBus who links emit and listeners', () => {
    const callback = vi.fn()
    const eventBus = createEventBus<boolean>('create-event-bus')

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('creates an eventBus who links emit and listeners with no event name', () => {
    const callback = vi.fn()
    const eventBus = createEventBus<boolean>()

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('creates an eventBus who links emit and listeners with a symbol', () => {
    const callback = vi.fn()
    const eventBus = createEventBus<boolean>()

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)

    expect(callback).toHaveBeenCalledWith(true)
  })

  it('creates an eventBus who links emit and listeners with a unique symbol', () => {
    const callback = vi.fn()
    const eventBus = createEventBus<boolean>()
    const eventBusCopy = createEventBus<boolean>()

    eventBus.addEventBusListener(callback)

    eventBus.emit(true)
    eventBusCopy.emit(true)

    expect(callback).toHaveBeenCalledOnce()
  })

  it('creates an eventBus and clears listeners', () => {
    const callback = vi.fn()
    const eventBus = createEventBus<boolean>('create-event-bus-clear')

    eventBus.addEventBusListener(callback)

    eventBus.clearEventBusListeners()

    eventBus.emit(true)

    expect(callback).not.toHaveBeenCalled()
  })

  it('clears emitted events', () => {
    const callback = vi.fn()
    const eventBus = createEventBus<void>()

    eventBus.emit()

    eventBus.clearEmittedEvents()

    eventBus.addEventBusListener(callback, {
      retro: true
    })

    expect(callback).not.toHaveBeenCalled()

    eventBus.emit()

    expect(callback).toHaveBeenCalledOnce()
  })
})
