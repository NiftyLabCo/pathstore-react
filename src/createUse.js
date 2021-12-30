import {equals, pick} from 'ramda'

export const createUseRunOnceOnChange = ({useRef, useEffect}) => (fn, dependencies) => {
  const lastRef = useRef({})
  useEffect(() => () => lastRef.current && lastRef.current.cleanup && lastRef.current.cleanup(), [])
  if (lastRef.current && equals(lastRef.current.dependencies, dependencies)) return
  if (lastRef.current && lastRef.current.cleanup) lastRef.current.cleanup()
  lastRef.current = {dependencies, cleanup: fn()}
}

export const createUse = ({store, useState, useRef, useEffect}) => {
  const useRunOnceOnChange = createUseRunOnceOnChange({useRef, useEffect})
  return (path, defaultValue, options = {}) => {
    const [value, setValue] = useState(
      () => {
        const storeValue = store.get(path)
        return (options.override || (storeValue === undefined && defaultValue !== undefined))
          ? defaultValue
          : storeValue
      }
    )
    const valueRef = useRef(value)
    useRunOnceOnChange(() => {
      const storeValue = store.get(path)
      const initialValue = (options.override || (storeValue === undefined && defaultValue !== undefined))
        ? defaultValue
        : storeValue
      valueRef.current = initialValue
      setValue({inner: initialValue})
      if (options.override || (storeValue === undefined && defaultValue !== undefined)) {
        store.set(path, defaultValue, {identifier: options.identifier})
      }
      const unsub = store.subscribe(path, () => {
        const newValue = store.get(path)
        if (!equals(newValue, valueRef.current)) {
          valueRef.current = newValue
          setValue({inner: newValue})
        }
      })
      return () => {
        if (options.cleanup) {
          store.set(path, undefined, {identifier: options.identifier})
        }
        unsub()
      }
    }, path)
    return [
      valueRef.current,
      (newValue, options2 = {}) =>
        store.set(path, newValue, {
          ...pick(['identifier', 'noPublish', 'setByFunction'], options),
          options2
        })
    ]
  }
}
