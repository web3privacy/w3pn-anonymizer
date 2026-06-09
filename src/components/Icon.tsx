export const Icon = ({ name, filled = false, size = 20 }: { name: string; filled?: boolean; size?: number }) => (
  <span
    className={`material-symbols-outlined${filled ? ' ms-filled' : ''}`}
    style={{ fontSize: size }}
    aria-hidden="true"
  >
    {name}
  </span>
)

export const EyeClosedIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
