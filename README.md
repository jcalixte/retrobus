<p align="center">

<img src="docs/logo.svg" alt="logo">
  
</p>

![npm](https://img.shields.io/npm/v/retrobus?style=for-the-badge)
![npm](https://img.shields.io/npm/dm/retrobus?style=for-the-badge)

# Retro Bus

`Retrobus` is a simple event bus for your JavaScript/TypeScript application.

## Features

- Trigger callback even if the listener is added after the event was first emitted with the property `retro`,
- JavaScript / TypeScript,
- Framework agnostic,
- 0 dependencies.

# Installation

npm:

```sh
npm install retrobus
```

yarn:

```sh
yarn add retrobus
```

pnpm:

```sh
pnpm add retrobus
```

# Usage

`Retrobus` implements 4 methods:

## Emit an event

```ts
import { emit } from 'retrobus'

emit('authenticated', {
  isUserAuthenticated: true
})
```

`emit` takes any additionnal parameters after the name.
Theses parameters will be passed to the listener callbacks.

## Listen to an event

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

|     name      |        type         |  default   | description                                                                                                                                                                                                                                                                                                       |
| :-----------: | :-----------------: | :--------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|     retro     |       boolean       |   false    | call retroactively the callback if the event was emitted before the listener                                                                                                                                                                                                                                      |
| retroStrategy | 'last-one' \| 'all' | 'last-one' | Define the strategy when calling previous emitted events. If `retroStrategy` is set to `all`, every emitted events will be called, from oldest to newest. If `retroStrategy` is set to `last-one`, only the last emitted event will be retractively called. Default to `last-one`. Ignored if `retro` is `false`. |
|     once      |       boolean       |   false    | remove the callback right after beeing called. If `retro` is true and if the event was previously emitted, the callback is directly called then removed.                                                                                                                                                          |
|    unique     |       boolean       |   false    | make sure the callback is only added once                                                                                                                                                                                                                                                                         |

`addEventBusListener` returns a callback to directly unsubscribe the listener added.

## Remove a listener

```ts
import { addEventBusListener, removeEventBusListener } from 'retrobus'

const fetchUserProfile = ({ isUserAuthenticated }) => {
  if (isUserAuthenticated) {
    console.log('user is authenticated!')
  }
}

addEventBusListener('authenticated', fetchUserProfile, {
  once: true,
  retro: true,
  unique: true
})

removeEventBusListener('authenticated', fetchUserProfile)
```

## Clear listeners

```ts
import { addEventBusListener, clearEventBusListeners } from 'retrobus'

const fetchUserProfile = ({ isUserAuthenticated }) => {
  if (isUserAuthenticated) {
    console.log('user is authenticated!')
  }
}

addEventBusListener('authenticated', fetchUserProfile, {
  once: true,
  retro: true
})

clearEventBusListeners('authenticated')
clearEventBusListeners() // clear all event listeners
```

## Clear emitted events

With `clearEmittedEvents(name)`, you can clear all the events from a specific key already emitted. If there is no parameter when calling the function, then all the emitted events are cleared.

## Create an event bus

```ts
import { createEventBus } from 'retrobus'

const eventBus = createEventBus<{ a: string; b: string }>('authentication')

eventBus.addEventBusListener((payload) => {
  console.log(payload.a, payload.b)
})

eventBus.emit({ a: 'Hello', b: 'World' })
```

## event name can be defined with strings or Symbols

These 2 implementations work:

```ts
import { createEventBus } from 'retrobus'

const eventBus = createEventBus<{ a: string; b: string }>() // default to Symbol()

eventBus.addEventBusListener((payload) => {
  console.log(payload.a, payload.b)
})

eventBus.emit({ a: 'Hello', b: 'World' })
```

```ts
import { createEventBus } from 'retrobus'

const eventName = Symbol('authentication')

const eventBus = createEventBus<{ a: string; b: string }>(eventName)

eventBus.addEventBusListener((payload) => {
  console.log(payload.a, payload.b)
})

eventBus.emit({ a: 'Hello', b: 'World' })
```

## Add event listener examples with framework

### VueJS

```vue
<template>
  <button @click="log">Greetings!</button>
</template>

<script>
import { addEventBusListener, emit, removeEventBusListener } from 'retrobus'

export default {
  name: 'HelloWorld',
  mounted() {
    addEventBusListener('log', this.greetings)
  },
  beforeDestroy() {
    removeEventBusListener('log', this.greetings)
  },
  methods: {
    greetings() {
      console.log('Hello world!')
    },
    log() {
      emit('log')
    }
  }
}
</script>
```

### React

```jsx
import { addEventBusListener, emit } from 'retrobus'

const HelloWorld = () => {
  useEffect(() => {
    const greetings = () => console.log('Hello World')

    return addEventBusListener('log', greetings)
  }, [])

  return <button onClick={() => emit('log')}>Greetings!</button>
}
```

### Angular

```ts
// content.component.ts
import { Component, OnDestroy } from '@angular/core'
import { addEventBusListener, emit, removeEventBusListener } from 'retrobus'

@Component({
  selector: 'app-content',
  templateUrl: 'content.component.html',
  styleUrls: ['content.component.scss']
})
export class ContentComponent implements OnDestroy {
  constructor() {
    addEventBusListener('log', this.greetings)
  }

  ngOnDestroy() {
    removeEventBusListener('log', this.greetings)
  }

  greetings() {
    console.log('Hello World')
  }

  log() {
    emit('log')
  }
}
```

```html
<!-- content.component.html -->
<button (click)="log()">Greetings!</button>
```

## Credits

Logo created with [Tabler Icons](https://tabler.io/icons/).
