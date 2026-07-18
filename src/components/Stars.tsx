interface StarsProps {
  value: number
  onChange?: (value: number) => void
  ariaLabel?: string
}

export default function Stars({ value, onChange, ariaLabel }: StarsProps) {
  const stars = [1, 2, 3, 4, 5]
  if (onChange) {
    return (
      <div role="radiogroup" aria-label={ariaLabel} className="flex gap-1">
        {stars.map(n => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={String(n)}
            onClick={() => onChange(n)}
            className={`text-xl cursor-pointer transition-colors ${n <= value ? 'text-paper' : 'text-white/25 hover:text-mist'}`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }
  return (
    <span aria-label={ariaLabel} className="text-sm tracking-[0.2em]">
      <span className="text-paper">{'★'.repeat(Math.round(value))}</span>
      <span className="text-white/25">{'★'.repeat(5 - Math.round(value))}</span>
    </span>
  )
}
