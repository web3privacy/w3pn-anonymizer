import { useContext } from 'react'
import type { AppMobileBindings } from './bindings'
import { MobileBindingsContext } from './MobileBindingsContext'

export function useMobileBindings(): AppMobileBindings {
  const ctx = useContext(MobileBindingsContext)
  if (!ctx) {
    throw new Error('useMobileBindings must be used within MobileBindingsProvider')
  }
  return ctx
}

export function useMobileBindingsOptional(): AppMobileBindings | null {
  return useContext(MobileBindingsContext)
}
