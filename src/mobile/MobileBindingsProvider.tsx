import type { ReactNode } from 'react'
import type { AppMobileBindings } from './bindings'
import { MobileBindingsContext } from './MobileBindingsContext'

export function MobileBindingsProvider({
  value,
  children,
}: {
  value: AppMobileBindings
  children: ReactNode
}) {
  return (
    <MobileBindingsContext.Provider value={value}>
      {children}
    </MobileBindingsContext.Provider>
  )
}
