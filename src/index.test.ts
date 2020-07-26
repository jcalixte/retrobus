describe('event bus', () => {
  it('calls an callback listener', () => {
    const callback = jest.fn()
    addEventBusListener('on-test', {
      name: 'testing',
      callback
    })

    emit('on-test')

    expect(callback).toHaveBeenCalled()
  })
})
