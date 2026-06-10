import { createContext } from 'react'
import type { AppMobileBindings } from './bindings'

export const MobileBindingsContext = createContext<AppMobileBindings | null>(null)
