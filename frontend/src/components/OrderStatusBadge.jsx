import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Clock, CheckCircle2, Package, Truck, Home, XCircle, RotateCcw,
} from 'lucide-react'

// Consistent status pill used across the account, orders and admin screens.
const STATUS_STYLES = {
  pending: 'bg-gold/15 text-[#b8860b] dark:text-gold',
  confirmed: 'bg-cobalt/15 text-cobalt',
  processing: 'bg-cobalt/15 text-cobalt',
  shipped: 'bg-magenta/15 text-magenta',
  delivered: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-gray-400/15 text-gray-500 dark:text-gray-400',
  returned: 'bg-brand/15 text-brand',
}

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: Home,
  cancelled: XCircle,
  returned: RotateCcw,
}

const OrderStatusBadge = ({ status, withIcon = true, className = '' }) => {
  const { t } = useTranslation()
  const key = String(status || 'pending').toLowerCase()
  const Icon = STATUS_ICONS[key] || Clock
  const style = STATUS_STYLES[key] || STATUS_STYLES.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${style} ${className}`}
    >
      {withIcon && <Icon size={13} strokeWidth={2.2} />}
      {t(`status.${key}`)}
    </span>
  )
}

export default OrderStatusBadge