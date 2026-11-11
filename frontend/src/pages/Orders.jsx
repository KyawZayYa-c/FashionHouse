import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, ChevronRight, ShoppingBag, Calendar, AlertCircle } from 'lucide-react'
import { orderApi, formatKyat } from '../services/baseApi.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge'
import EmptyState from '../components/EmptyState'

const FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const Orders = () => {
  const { t, i18n } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderApi.myOrders({ page: 1, limit: 100 })
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message || t('orders.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.orderStatus === filter)),
    [orders, filter]
  )

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(i18n.language?.startsWith('mm') ? 'en-GB' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="min-h-screen bg-porcelain dark:bg-ink">
      <div className="relative overflow-hidden border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-ink-900">
        <div className="aurora grain relative mx-auto max-w-5xl px-4 py-14 md:px-8">
          <nav className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-gray-400">
            <Link to="/account" className="transition-colors hover:text-brand">{t('account.title')}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-200">{t('orders.title')}</span>
          </nav>
          <h1 className="font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
            {t('orders.title')}
          </h1>
          <p className="mt-3 text-gray-500 dark:text-gray-400">{t('orders.subtitle')}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        {/* Status filter chips */}
        {!loading && !error && orders.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count = f === 'all' ? orders.length : orders.filter((o) => o.orderStatus === f).length
              if (f !== 'all' && count === 0) return null
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    filter === f
                      ? 'bg-brand text-white'
                      : 'border border-gray-300 text-gray-600 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-300'
                  }`}
                >
                  {f === 'all' ? t('orders.filterAll') : t(`status.${f}`)}
                  <span className="ml-1.5 opacity-70">{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="fh-skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={AlertCircle} title={t('orders.loadError')} description={error} actionLabel={t('common.retry')} onAction={load} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('orders.empty')}
            description={t('orders.emptyHint')}
            actionLabel={t('orders.empty') && t('account.startShopping')}
            actionTo="/shop"
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title={t('orders.empty')} description={t('orders.emptyHint')} />
        ) : (
          <div className="space-y-4">
            {filtered.map((o, i) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="fh-fade-up group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand hover:shadow-lift dark:border-gray-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand dark:bg-brand-900/30">
                    <ShoppingBag size={22} strokeWidth={1.7} />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{o.orderNumber}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={13} /> {fmtDate(o.createdAt)}
                      <span className="mx-1">·</span>
                      {t('orders.itemCount', { count: o.itemCount ?? 0 })}
                    </p>
                    <div className="mt-2">
                      <OrderStatusBadge status={o.orderStatus} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="font-display text-xl font-bold text-gray-900 dark:text-white">
                    {formatKyat(o.totalAmount)}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand">
                    {t('orders.viewDetails')}
                    <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders