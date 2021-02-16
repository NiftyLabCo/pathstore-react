import {equals} from 'ramda'

export const createUse = ({store, useEffect, useState}) =>
  (path, defaultValue, options = {}) => {
    const existing = store.get(path)
    const [value, setValue] = useState(
      (options.override || existing === undefined)
        ? defaultValue
        : existing
    )
    useEffect(() => {
      const existing = store.get(path)
      if (options.override || existing === undefined) {
        store.set(path, defaultValue, {identifier: options.identifier})
      }
      const unsub = store.subscribe(path, () => {
        const newValue = store.get(path)
        if (!equals(newValue, value)) {
          setValue(newValue)
        }
      })
      return () => {
        if (options.cleanup) {
          store.set(path, undefined, {identifier: options.identifier})
        }
        unsub()
      }
    }, [JSON.stringify(path)])
    return [
      value,
      (newValue, options2 = {}) =>
        store.set(path, newValue, {
          identifier: options2.identifier || options.identifier
        })
    ]
  }