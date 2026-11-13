import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { safeGet, safeSet } from '../utils/storage'

const UNIT_KEY = 'weatherboard:unit'

const UnitContext = createContext({ unit: 'c', setUnit: () => {} })

export function UnitProvider({ children }) {
  const [unit, setUnitState] = useState(() =>
    safeGet(UNIT_KEY, 'c') === 'f' ? 'f' : 'c',
  )

  const setUnit = useCallback((next) => {
    setUnitState(next)
    safeSet(UNIT_KEY, next)
  }, [])

  const value = useMemo(() => ({ unit, setUnit }), [unit, setUnit])

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUnit() {
  return useContext(UnitContext)
}