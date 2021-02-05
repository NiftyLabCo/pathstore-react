# Pathstore

A simple, performant global store that works well with React.

✨ Also works with redux devtools ✨

## Table of Contents

-   [From React local state to Pathstore](#from-react-local-state-to-pathstore)
-   [Getting Started](#getting-started)
-   [Examples](#examples)
-   [API](#api)
-   [License](#license)

## From React local state to Pathstore

Suppose we have a simple counter component that uses local react state:

```js
const ReactCounter = () => {
  const [count, setCount] = useState(0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

To use Pathstore instead of local state, simply replace this line:

```js
const [count, setCount] = useState(0)
```

with this:

```js
const [count, setCount] = store.use(['counter'], 0)
```

The counter value will now be stored in the global store under the key `counter`

```js
{ counter: 0 }
```

Suppose we want the counter value nested somewhere in our global state,

```js
{ counters: { exampleCounter: 0 } }
```

We would update the array we passed to `store.use`, like this:

```js
const [count, setCount] = store.use(['counters', 'exampleCounter'], 0)
```

## Getting started

install

```bash
npm install --save pathstore
```

create a store

```js
import {createStore} from 'pathstore'
import {useEffect, useState} from 'react'

export const store = createStore({ useEffect, useState, withReduxDevtools: true })
```

use the store

## Examples

TODO

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [createStore](#createstore)
-   [store](#store)
    -   [set](#storeset)
    -   [get](#storeget)
    -   [subscribe](#storesubscribe)
    -   [use](#storeuse)

### createStore

Creates a new store.

#### Parameters

-   `init` **Object** The initialization object.
    -   `useState` **Function** The useState function from react or preact.
    -   `useEffect` **Function** The useEffect function from react or preact.
    -   `reduxDevTools` **Boolean** Whether to turn on redux devtools.

#### Returns

-   `store` **Object** A [store](#store)

#### Examples

```javascript
import { useState, useEffect } from 'react'
let store = createStore({useState, useEffect, reduxDevTools: true})
store.subscribe([], state => console.log(state) );
store.set(['a'], 'b')   // logs { a: 'b' }
store.set(['c'], 'd')   // logs { a: 'b', c: 'd' }
```

### store

An observable state container, returned from [createStore](#createstore)

### store.set

A function for changing a value in the store's state.
Will call all subscribe functions of changed path.

#### Parameters

-   `path` **Array** The path to set.
-   `value` **Any** The new value. If you provide a function, it will be given the current value at path and should return a new value. (see examples).
-   `options` **Object** (optional) Some additional options.
    -   `noPublish` **Boolean** (optional) Do not trigger subscriber functions. The subscribe functions that would have been called will instead be called the next time `store.set` is called without the `noPublish` option

#### Examples

```js
store.set([], {}) // the store is {}
store.set(['a'], 1) // the store is {a: 1}
store.set(['a'], x => x + 1) // the store is {a: 2}
store.set(['b', 0, 'c'], 1) // the store is {a: 2, b: [{c: 1}]}
```

### store.get

A function for retrieving values in the store's state.

#### Parameters

-   `path` **Array** The path to use.

#### Returns

-   `value` **Any** The value at `path`.

#### Examples

```javascript
store.set([], {a: 1, b: {c: 'd'}, e: ['f', 'g', 'h']})
store.get(['a'])  // => 1
store.get(['b', 'c'])  // => 'd'
store.get(['e', 1])  // => 'g'
store.get(['e', 4])  // => undefined
store.get(['z'])  // => undefined
store.get([])  // => {a: 1, b: {c: 'd'}, e: ['f', 'g', 'h']}
```

### store.subscribe

Add a function to be called whenever state changes anywhere along the specified path.

#### Parameters

-   `path` **Array** The path to use.
-   `subscriber` **Function** The function to call when state changes along the path.

#### Returns

- `unsubscribe` **Function** Stop `subscriber` from being called anymore.

#### Examples

Subscribe to any state changes

```js
let unsub = store.subscribe([], () => console.log('state has changed') );
store.set(['a'], 'b')   // logs 'state has changed'
store.set(['c'], 'd')   // logs 'state has changed'
store.set([], {})   // logs 'state has changed'
unsub()   // stop our function from being called
store.set(['a'], 3)   // does not log anything
```

Subscribe to a specific path in state

```js
let unsub = store.subscribe(['a', 'b', 'c'], () => console.log('a.b.c state has changed') );
store.set([], {a: {b: {c: 4}}})   // logs 'a.b.c state has changed'
store.set(['a', 'b', 'c'], 5)   // logs 'a.b.c state has changed'
store.set(['b'], 5)   // does not log anything
store.set(['a', 'b', 'd'], 2)   // does not log anything
store.set(['a', 'b', 'c', 'd', 'e'], 2)   // logs 'a.b.c state has changed'
store.set([], {x: 123})   // logs 'a.b.c state has changed'
```

### store.use

Hook that returns a stateful value, and a function to update it.

#### Parameters

-   `path` **Array** The path to use.
-   `initialValue`  **Any** (optional) The initial value.
-   `options`  **Object** (optional) Some additional options.
    -   `cleanup`  **Boolean**  (optional, default `false`) Set the value at `path` in state to `undefined` when the component unmounts.
    -   `override`  **Boolean**  (optional, default `false`) Set the value at `path` to `initialValue` even if there is already a value there.

#### Return

-   `[value, setValue]` **Array** 
    -   `value` **Any** The value at `path`
    -   `setValue` **Function** Set a new value at path

#### Examples

A counter component, the value of the counter will be stored in state
under `{counter: <here>}`

```js
const Counter = () => {
  const [count, setCount] = store.use(['counter'], 0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

The same component, but storing the count under `{counter: {nested: <here>}}`

```js
const Counter = () => {
  const [count, setCount] = store.use(['counter', 'nested'], 0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

This time storing the count under a dynamic id key `{counter: {<id>: <here>}}`

```js
const Counter = ({id}) => {
  const [count, setCount] = store.use(['counter', id], 0)
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

Using the cleanup option. When the component unmounts the value will be set to undefined, `{counter: undefined}`

```js
const Counter = () => {
  const [count, setCount] = store.use(['counter'], 0, {cleanup: true})
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count}</span>
  </div>
}
```

Using the override option. When the component mounts the value will be set to initialValue, even if there is already a value in state. `count` will be `0` because the current value `4` is overriden with the initial value `0`

```js
store.set([], {counter: 4})
const Counter = () => {
  const [count, setCount] = store.use(['counter'], 0, {override: true})
  return <div>
    <button onClick={() => setCount(count + 1)} >Increment</button>
    <span>count: {count} will always start at 0</span>
  </div>
}
```

