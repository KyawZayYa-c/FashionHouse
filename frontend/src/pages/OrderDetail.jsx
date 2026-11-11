import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, MapPin, Package, CreditCard, AlertCircle, XCircle, CheckCircle2, StickyNote,
} from 'lucide-react'
import { orderApi, formatKyat, parsePrice } from '../services/baseApi.jsx'
import { colorSwatch } from '../lib/catalog'
import OrderStatusBadge from '../components/OrderStatusBadge'
import EmptyState from '../components/EmptyState'
import { useToast } from '../hooks/useToast'

const CANCELLABLE = ['pending', 'confirmed', 'processing']

const OrderDetail = () => {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderApi.myOrderById(id)
      setOrder(data.order)
    } catch (err) {
      setError(err.message || t('orders.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const data = await orderApi.cancel(id, reason)
      setOrder(data.order)
      setCancelOpen(false)
      toast.success(t('orders.cancelled'))
    } catch (err) {
      toast.error(err.message || t('orders.loadError'))
    } finally {
      setCancelling(false)
    }
  }

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(i18n.language?.startsWith('mm') ? 'en-GB' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <div className="fh-skeleton h-8 w-40 rounded" />
        <div className="fh-skeleton mt-6 h-40 rounded-2xl" />
        <div className="fh-skeleton mt-4 h-64 rounded-2xl" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <EmptyState
          icon={AlertCircle}
          title={t('orders.notFound')}
          description={error}
          actionLabel={t('orders.backToOrders')}
          actionTo="/orders"
        />
      </div>
    )
  }

  const addr = order.shippingAddress || {}
  const canCancel = CANCELLABLE.includes(order.orderStatus)
  const payKey = String(order.paymentStatus || 'unpaid').toLowerCase()

  return (
    <div className="min-h-screen bg-porcelain dark:bg-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
        <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand dark:text-gray-400">
          <ArrowLeft size={16} /> {t('orders.backToOrders')}
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-gray-400">{t('orders.orderNumber')}</p>
            <h1 className="mt-1 font-display text-2xl font-black text-gray-900 dark:text-white md:text-3xl">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('orders.placedOn', { date: fmtDate(order.createdAt) })}</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <OrderStatusBadge status={order.orderStatus} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-ink-800 dark:text-gray-300">
              <CreditCard size={13} /> {t('orders.paymentStatus')}: {t(`payment.${payKey}`)}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Items + address */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-900">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900 dark:text-white">
                <Package size={18} className="text-brand" /> {t('orders.orderItems')}
              </h2>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {(order.items || []).map((item, i) => {
                  const name = item.productName || item.productId?.productName || 'Item'
                  const slug = item.productId?.slug
                  return (
                    <li key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <span
                        className="h-10 w-10 shrink-0 rounded-full border border-gray-200 dark:border-gray-700"
                        style={{ backgroundColor: colorSwatch(item.color) }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        {slug ? (
                          <Link to={`/product/${slug}`} className="font-semibold text-gray-900 transition-colors hover:text-brand dark:text-white">{name}</Link>
                        ) : (
                          <p className="font-semibold text-gray-900 dark:text-white">{name}</p>
                        )}
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {[item.size, item.color].filter(Boolean).join(' · ')}
                          {item.sku ? ` · ${item.sku}` : ''}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">{formatKyat(item.price)} × {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatKyat(item.subtotal ?? parsePrice(item.price) * item.quantity)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-900">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900 dark:text-white">
                <MapPin size={18} className="text-brand" /> {t('orders.shippingAddress')}
              </h2>
              <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-white">{addr.recipientName}</p>
                <p>{addr.phone}</p>
                <p className="mt-1">{[addr.address, addr.township, addr.city].filter(Boolean).join(', ')}</p>
              </div>
              {order.notes && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-porcelain-200/60 p-3 text-sm text-gray-600 dark:bg-ink-800 dark:text-gray-300">
                  <StickyNote size={15} className="mt-0.5 shrink-0 text-gold" />
                  <span>{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-900">
              <h2 className="mb-4 font-display text-lg font-bold text-gray-900 dark:text-white">{t('orders.summary')}</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <dt>{t('cart.subtotal')}</dt>
                  <dd className="font-semibold">{formatKyat(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <dt>{t('cart.shipping')}</dt>
                  <dd className="font-semibold">{parsePrice(order.deliveryFee) === 0 ? t('cart.free') : formatKyat(order.deliveryFee)}</dd>
                </div>
                {parsePrice(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <dt>{t('cart.discount')}</dt>
                    <dd className="font-semibold">−{formatKyat(order.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base dark:border-gray-800">
                  <dt className="font-bold text-gray-900 dark:text-white">{t('cart.total')}</dt>
                  <dd className="font-display text-xl font-black text-brand">{formatKyat(order.totalAmount)}</dd>
                </div>
              </dl>

              {canCancel && (
                <button
                  onClick={() => setCancelOpen(true)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-brand px-5 py-3 text-sm font-semibold uppercase tracking-wider text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  <XCircle size={16} /> {t('orders.cancel')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel confirmation */}
      {cancelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => !cancelling && setCancelOpen(false)}>
          <div className="fh-toast-in w-full max-w-md rounded-2xl bg-white p-6 dark:bg-ink-900" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand dark:bg-brand-900/30">
              <XCircle size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">{t('orders.cancel')}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('orders.cancelConfirm')}</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('orders.cancelReason')}
              rows={2}
              className="mt-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-ink-800 dark:text-white"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setCancelOpen(false)}
                disabled={cancelling}
                className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
              >
                {t('common.back')}
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60"
              >
                {cancelling ? t('common.loading') : <><CheckCircle2 size={16} /> {t('common.confirm')}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail