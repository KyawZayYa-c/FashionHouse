import React from 'react'
import { Minus, Plus } from 'lucide-react'

// Accessible quantity stepper used in the cart and product detail.
const QuantityStepper = ({ value, onChange, min = 1, max = 99, disabled = false, compact = false }) => {
  const clamp = (n) => Math.max(min, Math.min(max, n))
  const btn =
    'flex items-center justify-center text-gray-600 transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:text-white'
  const size = compact ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <div
      className={`inline-flex items-center rounded-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-ink-800 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={`${btn} ${size}`}
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus size={compact ? 14 : 16} strokeWidth={2.2} />
      </button>
      <span
        className={`min-w-[2.25rem] text-center font-semibold tabular-nums text-gray-900 dark:text-white ${
          compact ? 'text-sm' : 'text-base'
        }`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className={`${btn} ${size}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus size={compact ? 14 : 16} strokeWidth={2.2} />
      </button>
    </div>
  )
}

export default QuantityStepper