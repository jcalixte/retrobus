<p align="center">

<img src="docs/logo.svg" alt="logo">
  
</p>

![npm](https://img.shields.io/npm/v/retrobus?style=for-the-badge)
![npm](https://img.shields.io/npm/dm/retrobus?style=for-the-badge)
![travis](https://img.shields.io/travis/jcalixte/retrobus?style=for-the-badge)
![coveralls](https://img.shields.io/coveralls/github/jcalixte/retrobus?style=for-the-badge)

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

# Usage

`Retrobus` implements 3 methods:

## Emit an event

```ts
import { emit } from 'retrobus'

emit('authenticated', {
  isUserAuthenticated: true
})
```

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

| name  |  type   | default | description                                                                                                                                              |
| :---: | :-----: | :-----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| retro | boolean |  false  | call retroactively the callback if the event was emitted before the listener                                                                             |
| once  | boolean |  false  | remove the callback right after beeing called. If `retro` is true and if the event was previously emitted, the callback is directly called then removed. |

`emit` takes any additionnal parameters after the name.

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
  retro: true
})

removeEventBusListener('authenticated', fetchUserProfile)
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
import { addEventBusListener, emit, removeEventBusListener } from 'retrobus'

const HelloWorld = () => {
  useEffect(() => {
    const greetings = () => console.log('Hello World')

    addEventBusListener('log', greetings)

    return () => {
      removeEventBusListener('log', greetings)
    }
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

Logo created with [Tabler Icons](https://tablericons.com/).
