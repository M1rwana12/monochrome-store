import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  alignRight?: boolean
}

// Headless listbox-style select styled for the MONOCHROME theme.
// Keyboard: Enter/Space/ArrowDown opens, arrows navigate, Enter selects, Esc closes.
export default function Select({ label, value, options, onChange, alignRight }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const selected = options.find(o => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const openList = () => {
    setActiveIndex(Math.max(0, options.findIndex(o => o.value === value)))
    setOpen(true)
  }

  const commit = (index: number) => {
    onChange(options[index].value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    switch (e.key) {
      case 'Escape':
        setOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        commit(activeIndex)
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className="bg-ink border border-white/20 px-3 py-2 text-xs uppercase tracking-widest focus:border-paper outline-none cursor-pointer flex items-center gap-2"
      >
        {selected.label}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={label}
          className={`absolute z-30 mt-1 min-w-full w-max bg-coal border border-white/20 py-1 ${alignRight ? 'right-0' : 'left-0'}`}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onPointerDown={() => commit(i)}
              onPointerMove={() => setActiveIndex(i)}
              className={`px-3 py-2 text-xs uppercase tracking-widest cursor-pointer ${
                i === activeIndex ? 'bg-paper text-ink' : ''
              } ${o.value === value && i !== activeIndex ? 'text-paper' : ''}`}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
