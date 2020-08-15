import {
  addEventBusListener,
  clearEventBusListeners,
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

    addEventBusListener('on-test', callback1)
    addEventBusListener('on-test', callback2)

    emit('on-test')

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
  })

  it('calls a callback listener with args', () => {
    const callback = jest.fn()
    const args = [1, 'test', true]
    addEventBusListener('on-test', callback)
    emit('on-test', ...args)

    expect(callback).toHaveBeenCalledWith(...args)
  })

  it("doesn't call a callback if the listener is added to late", () => {
    const callback = jest.fn()

    emit('on-test')

    addEventBusListener('on-test', callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('calls a callback retroactively if the listener is added to late', () => {
    const callback = jest.fn()

    emit('on-test')

    addEventBusListener('on-test', callback, {
      retro: true
    })

    expect(callback).toHaveBeenCalled()
  })

  it('calls a callback multiple times', () => {
    const callback = jest.fn()

    emit('on-test')

    addEventBusListener('on-test', callback, {
      retro: true
    })

    emit('on-test')
    emit('on-test')

    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('calls a one time callback only once', () => {
    const callback = jest.fn()

    addEventBusListener('on-test', callback, {
      once: true
    })

    emit('on-test')
    emit('on-test')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('calls a one time callback retroactively only once', () => {
    const callback = jest.fn()

    emit('on-test')

    addEventBusListener('on-test', callback, {
      once: true,
      retro: true
    })

    emit('on-test')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('does nothing when removing before adding', () => {
    const callback = jest.fn()
    removeEventBusListener('on-test', callback)

    addEventBusListener('on-test', callback)

    emit('on-test')
    removeEventBusListener('on-test', callback)

    emit('on-test')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('removes the listening callback', () => {
    const callback = jest.fn()

    addEventBusListener('on-test', callback)

    emit('on-test')
    removeEventBusListener('on-test', callback)

    emit('on-test')

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('clears listeners', () => {
    const callback = jest.fn()

    addEventBusListener('on-test', callback)

    clearEventBusListeners('on-test')

    emit('on-test')

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
})
