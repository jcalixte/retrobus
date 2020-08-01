<p align="center">

<img src="docs/logo.svg" alt="logo">
  
![npm](https://img.shields.io/npm/v/retrobus?style=for-the-badge)
![npm](https://img.shields.io/npm/dm/retrobus?style=for-the-badge)

# Retro Bus

</p>

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

const fetchUserProfile = ({ isUserAuthenticated }) => {
  if (isUserAuthenticated) {
    console.log('user is authenticated!')
  }
}

addEventBusListener('authenticated', fetchUserProfile, {
  once: true,
  retro: true
})
```

`addEventBusListener` has multiple options that allow you to configure the listener's behavior:

| name  |  type   | default | description                                                                                                      |
| :---: | :-----: | :-----: | ---------------------------------------------------------------------------------------------------------------- |
| retro | boolean |  false  | directly call the callback if the event was emitted before the listener                                          |
| once  | boolean |  false  | remove the callback right after beeing called. If `retro` is true, the callback is directly called then removed. |

## Emit events

```ts
import { emit } from 'retrobus'

emit('authenticated', {
  isUserAuthenticated: true
})
```

`emit` takes any additionnal parameters after the name.

## Remove a callback

```ts
import { addEventBusListener, removeEventBusListener } from 'retrobus'

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
```

## Credits

Logo created with [Tabler Icons](https://tablericons.com/).
