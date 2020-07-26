import { addEventBusListener, emit, removeEventBusListener } from './index'

describe('event bus', () => {
  it('calls a callback listener', () => {
    const callback = jest.fn()
    addEventBusListener('on-test', callback)

    emit('on-test')

    expect(callback).toHaveBeenCalled()
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

  it('removes the listening callback', () => {
    const callback = jest.fn()

    addEventBusListener('on-test', callback)

    emit('on-test')
    removeEventBusListener('on-test', callback)

    emit('on-test')

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
