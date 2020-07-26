# Retro Bus

`Retrobus` is a simple event bus for your Javascript application. The extra feature is that it allows to trigger callback even if the listener is added after the event was emitted.

`Retrobus` is compatible with TypeScript and has no dependencies.

# Installation

npm:

```sh
npm install retrobus
```

yarn:

```sh
yarn add retrobus
```

# Usage

`Retrobus` implements 3 methods:

## Listen to event

```ts
import { addEventBusListener } from 'retrobus'

const fetchUserData = () => {
  const fetchUserProfile = ({ isUserAuthenticated }) => {
    if (isUserAuthenticated) {
      console.log('user is authenticated!')
    }
  }

  addEventBusListener('authenticated', fetchUserProfile, {
    once: true,
    retro: true
  })
}
```

`addEventBusListener` has a optionnal param that allows you to configure the listener's behavior:

| name  |   type   | description                                                                                                          |
| :---: | :------: | -------------------------------------------------------------------------------------------------------------------- |
| retro | boolean? | directly call the callback if the event was emitted before the listener                                              |
| once  | boolean? | remove the callback right after beeing called. If `retro` is true, the callback is directly called and then removed. |

## Emit events

```ts
import { emit } from 'retrobus'

emit('authenticated', {
  isUserAuthenticated: true
})
```

`emit` accepts any additionnal parameters

## Remove a callback

```ts
import { addEventBusListener, removeEventBusListener } from 'retrobus'

const listenToEvent = () => {
  const fetchUserProfile = ({ isUserAuthenticated }) => {
    if (isUserAuthenticated) {
      console.log('user is authenticated!')
    }
  }

  addEventBusListener('authenticated', fetchUserProfile, {
    once: true,
    retro: true
  })

  removeEventBusListener('authenticated', fetchUserProfile)
}
```
