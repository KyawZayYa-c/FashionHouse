import React from 'react'
import { Link } from 'react-router-dom'

// A friendly, on-brand empty state with an optional call to action.
const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo, onAction }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center dark:border-gray-700 dark:bg-ink-800/40">
    {Icon && (
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand dark:bg-brand-900/30">
        <Icon size={28} strokeWidth={1.7} />
      </div>
    )}
    <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
    {description && (
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
    )}
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="mt-6 rounded-full bg-brand px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-600"
      >
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && !actionTo && (
      <button
        type="button"
        onClick={onAction}
        className="mt-6 rounded-full bg-brand px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-600"
      >
        {actionLabel}
      </button>
    )}
  </div>
)

export default EmptyState