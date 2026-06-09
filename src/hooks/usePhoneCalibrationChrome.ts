import { useEffect, useState } from 'react'

/** Phone-only calibration chrome (bottom dock). Tablet+ uses corner Skip. */
const QUERY = '(max-width: 639px)'

export function usePhoneCalibrationChrome(): boolean {
  const [isPhone, setIsPhone] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setIsPhone(e.matches)
    mq.addEventListener('change', onChange)
    setIsPhone(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isPhone
}
