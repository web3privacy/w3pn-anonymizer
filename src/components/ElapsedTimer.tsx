import { useEffect, useState } from 'react'

/** Live elapsed timer — renders seconds since mount. */
export function ElapsedTimer() {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    const t0 = Date.now()
    const iv = setInterval(() => setSec(Math.floor((Date.now() - t0) / 1000)), 500)
    return () => clearInterval(iv)
  }, [])
  return (
    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
      {sec}s elapsed
    </span>
  )
}
