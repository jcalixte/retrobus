```ts
import { addEventBusListener } from 'retrobus'

const listenToEvent = () => {
  const onDocumentReady = () => {
    console.log('document is ready')
  }

  addEventBusListener('ready', onDocumentReady, {
    once: true,
    retro: true
  })
}

listenToEvent()
```
