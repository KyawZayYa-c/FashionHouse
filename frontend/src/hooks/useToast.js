import { useState } from 'react'

// Toast notification hook
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now()
    setToasts([...toasts, { id, message, type }])
    setTimeout(() => {
      setToasts(toasts.filter((t) => t.id !== id))
    }, duration)
  }

  const successToast = (message) => showToast(message, 'success')
  const errorToast = (message) => showToast(message, 'error')
  const infoToast = (message) => showToast(message, 'info')

  return { toasts, showToast, successToast, errorToast, infoToast }
}