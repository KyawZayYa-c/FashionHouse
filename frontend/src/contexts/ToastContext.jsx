import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const ACCENT = {
  success: 'border-l-emerald-500 text-emerald-600 dark:text-emerald-400',
  error: 'border-l-[#e8363c] text-[#e8363c] dark:text-[#ff6b6f]',
  warning: 'border-l-[#F2B75A] text-[#c98a1f] dark:text-[#F2B75A]',
  info: 'border-l-blue-500 text-blue-600 dark:text-blue-400',
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'info', duration = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((list) => [...list, { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  const api = useMemo(
    () => ({
      toasts,
      showToast,
      dismiss,
      success: (m, d) => showToast(m, 'success', d),
      error: (m, d) => showToast(m, 'error', d),
      warning: (m, d) => showToast(m, 'warning', d),
      info: (m, d) => showToast(m, 'info', d),
      // Backwards-compatible aliases used by older components.
      successToast: (m, d) => showToast(m, 'success', d),
      errorToast: (m, d) => showToast(m, 'error', d),
      infoToast: (m, d) => showToast(m, 'info', d),
    }),
    [toasts, showToast, dismiss]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

const ToastViewport = ({ toasts, dismiss }) => (
  <div
    className="fixed top-20 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
    role="region"
    aria-live="polite"
    aria-label="Notifications"
  >
    {toasts.map((toast) => {
      const Icon = ICONS[toast.type] || Info
      return (
        <div
          key={toast.id}
          className={`fh-toast-in pointer-events-auto flex items-start gap-3 rounded-lg border border-gray-200 border-l-4 bg-white/95 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 ${ACCENT[toast.type] || ACCENT.info}`}
          role="status"
        >
          <Icon size={20} strokeWidth={2} className="mt-0.5 shrink-0" />
          <p className="flex-1 text-sm font-medium leading-snug text-gray-800 dark:text-gray-100">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="shrink-0 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )
    })}
  </div>
)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    // Safe no-op fallback so a component rendered outside the provider never crashes.
    const noop = () => {}
    return {
      toasts: [],
      showToast: noop,
      dismiss: noop,
      success: noop,
      error: noop,
      warning: noop,
      info: noop,
      successToast: noop,
      errorToast: noop,
      infoToast: noop,
    }
  }
  return ctx
}

export default ToastContext