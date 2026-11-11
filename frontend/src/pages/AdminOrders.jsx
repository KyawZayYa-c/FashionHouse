import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, MapPin, Package,
} from 'lucide-react'
import { orderApi, formatKyat } from '../services/baseApi.jsx'
import { colorSwatch } from '../lib/catalog'
import OrderStatusBadge from '../components/OrderStatusBadge'
import EmptyState from '../components/EmptyState'
import { useToast } from '../hooks/useToast'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
const FILTERS = ['all', ...STATUSES]
const PAGE_SIZE = 10

const AdminOrders = () => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expanded, setExpanded] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = async (status = filter, p = page) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: p, limit: PAGE_SIZE }
      if (status !== 'all') params.status = status
      const data = await orderApi.allOrders(params)
      setOrders(data.orders || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err.message || t('admin.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filter, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page])

  const changeFilter = (f) => { setFilter(f); setPage(1); setExpanded(null) }

  const updateStatus = async (order, status) => {
    if (status === order.orderStatus) return
    const prev = order.orderStatus
    setBusyId(order._id)
    setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, orderStatus: status } : o)))
    try {
      await orderApi.updateStatus(order._id, status)
      toast.success(t('admin.orders.updated'))
    } catch (err) {
      setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, orderStatus: prev } : o)))
      toast.error(err.message || t('admin.loadError'))
    } finally {
      setBusyId(null)
    }
  }

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(i18n.language?.startsWith('mm') ? 'en-GB' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">{t('admin.orders.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('admin.orders.subtitle')}</p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => changeFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-brand text-white' : 'border border-gray-300 text-gray-600 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            {f === 'all' ? t('admin.orders.all') : t(`status.${f}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fh-skeleton h-16 rounded-xl" />)}</div>
      ) : error ? (
        <EmptyState icon={AlertCircle} title={t('admin.loadError')} description={error} actionLabel={t('admin.retry')} onAction={() => load()} />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingCart} title={t('admin.orders.empty')} />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-900/40">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('admin.orders.order')}</th>
                    <th className="px-4 py-3 font-semibold">{t('admin.customer')}</th>
                    <th className="px-4 py-3 font-semibold">{t('admin.date')}</th>
                    <th className="px-4 py-3 font-semibold">{t('admin.amount')}</th>
                    <th className="px-4 py-3 font-semibold">{t('admin.orderStatus')}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {orders.map((o) => (
                    <React.Fragment key={o._id}>
                      <tr className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                        <td className="px-4 py-3">
                          <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">{o.orderNumber}</p>
                          <p className="text-xs text-gray-400">{t('orders.itemCount', { count: (o.items || []).length })}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-white">{o.userId?.username || '—'}</p>
                          <p className="text-xs text-gray-400">{o.userId?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{fmtDate(o.createdAt)}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{formatKyat(o.totalAmount)}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.orderStatus}
                            disabled={busyId === o._id}
                            onChange={(e) => updateStatus(o, e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 outline-none focus:border-brand disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/10"
                          >
                            {t('admin.orders.viewItems')}
                            <ChevronDown size={14} className={`transition-transform ${expanded === o._id ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>
                      {expanded === o._id && (
                        <tr className="bg-porcelain-200/40 dark:bg-gray-900/60">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                              <div>
                                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"><Package size={13} /> {t('admin.orders.items')}</h4>
                                <ul className="space-y-2">
                                  {(o.items || []).map((it, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm">
                                      <span className="h-6 w-6 shrink-0 rounded-full border border-gray-200 dark:border-gray-700" style={{ backgroundColor: colorSwatch(it.color) }} />
                                      <span className="flex-1 text-gray-700 dark:text-gray-200">{it.productName} <span className="text-gray-400">· {[it.size, it.color].filter(Boolean).join(' / ')} × {it.quantity}</span></span>
                                      <span className="font-semibold text-gray-900 dark:text-white">{formatKyat(it.subtotal)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400"><MapPin size={13} /> {t('admin.orders.shippingTo')}</h4>
                                <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                  <p className="font-semibold text-gray-900 dark:text-white">{o.shippingAddress?.recipientName}</p>
                                  <p>{o.shippingAddress?.phone}</p>
                                  <p>{[o.shippingAddress?.address, o.shippingAddress?.township, o.shippingAddress?.city].filter(Boolean).join(', ')}</p>
                                  <div className="mt-2"><OrderStatusBadge status={o.orderStatus} /></div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-brand hover:text-brand disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"><ChevronLeft size={16} /></button>
              <span className="px-3 text-sm font-semibold text-gray-600 dark:text-gray-300">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-brand hover:text-brand disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"><ChevronRight size={16} /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminOrders