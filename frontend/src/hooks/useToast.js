// Global toast hook. The real implementation lives in ToastContext so every
// component shares one notification stack rendered at the app root.
export { useToast } from '../contexts/ToastContext'