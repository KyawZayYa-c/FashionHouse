import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Trash2, ArrowRight, Truck, X, ChevronRight } from 'lucide-react'
import { formatKyat } from '../services/baseApi.jsx'
import {
  FREE_SHIPPING_THRESHOLD, deliveryFeeFor, colorSwatch,
} from '../lib/catalog'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import {
  selectCartItems, selectCartTotalAmount, selectCartTotalItems,
  updateQuantityThunk, removeItemThunk, clearCartThunk,
} from '../features/cart/cartSlice.jsx'
import { selectIsAuthenticated } from '../features/auth/authSlice.jsx'
import { useToast } from '../hooks/useToast'
import ProductImage from '../components/ProductImage'
import QuantityStepper from '../components/QuantityStepper'
import EmptyState from '../components/EmptyState'

const Cart = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const items = useAppSelector(selectCartItems)
  const subtotal = useAppSelector(selectCartTotalAmount)
  const count = useAppSelector(selectCartTotalItems)
  const isAuthed = useAppSelector(selectIsAuthenticated)
  const [confirmClear, setConfirmClear] = useState(false)

  const delivery = deliveryFeeFor(subtotal)
  const total = subtotal + delivery
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  const handleQty = (item, quantity) => {
    dispatch(updateQuantityThunk({ productId: item.productId, variantId: item.variantId, quantity }))
  }
  const handleRemove = (item) => {
    dispatch(removeItemThunk({ productId: item.productId, variantId: item.variantId }))
    toast.info(t('cart.removed'))
  }
  const handleClear = () => {
    dispatch(clearCartThunk())
    setConfirmClear(false)
    toast.info(t('cart.cleared'))
  }
  const goCheckout = () => {
    if (isAuthed) navigate('/checkout')
    else navigate('/login', { state: { from: { pathname: '/checkout' } } })
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <h1 className="mb-8 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          {t('cart.title')}
        </h1>
        <EmptyState
          icon={ShoppingBag}
          title={t('cart.empty')}
          description={t('cart.emptyHint')}
          actionLabel={t('cart.continueShopping')}
          actionTo="/shop"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-porcelain dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <nav className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-gray-400">
          <Link to="/" className="transition-colors hover:text-brand">{t('nav.home')}</Link>
          <ChevronRight size={13} />
          <span className="text-gray-700 dark:text-gray-200">{t('cart.title')}</span>
        </nav>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {t('cart.title')}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('cart.itemCount', { count })}</p>
          </div>
          <button
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand dark:text-gray-400"
          >
            <Trash2 size={15} /> {t('cart.clear')}
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="space-y-4">
            {/* Free shipping progress */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-ink-800/50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <Truck size={18} className="text-brand" />
                {remaining > 0
                  ? t('cart.freeShippingHint', { amount: formatKyat(remaining) })
                  : t('cart.freeShippingQualified')}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-ink-700">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {items.map((item) => (
              <article
                key={`${item.productId}-${item.variantId}`}
                className="fh-fade-up flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-ink-800/50"
              >
                <Link
                  to={`/product/${item.slug}`}
                  className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden rounded-xl bg-porcelain-200 dark:bg-ink-700 sm:w-28"
                >
                  <ProductImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/product/${item.slug}`}
                        className="font-display text-lg font-semibold text-gray-900 transition-colors hover:text-brand dark:text-white"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {item.color && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-full border border-gray-300" style={{ backgroundColor: colorSwatch(item.color) }} />
                            {item.color}
                          </span>
                        )}
                        {item.size && <span>· {item.size}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      aria-label={t('cart.remove')}
                      className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-brand-50 hover:text-brand dark:hover:bg-brand-900/30"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => handleQty(item, q)}
                      compact
                    />
                    <div className="text-right">
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {formatKyat(item.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-400">{formatKyat(item.price)} {t('cart.each')}</p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-brand hover:underline"
            >
              <ArrowRight size={15} className="rotate-180" /> {t('cart.continueShopping')}
            </Link>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:h-max">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-ink-800/50">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{t('cart.summary')}</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{t('cart.subtotal')}</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{formatKyat(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{t('cart.shipping')}</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">
                    {delivery === 0 ? <span className="text-emerald-600 dark:text-emerald-400">{t('cart.free')}</span> : formatKyat(delivery)}
                  </dd>
                </div>
                <div className="my-3 border-t border-dashed border-gray-200 dark:border-gray-700" />
                <div className="flex items-baseline justify-between">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">{t('cart.total')}</dt>
                  <dd className="font-display text-2xl font-black text-brand">{formatKyat(total)}</dd>
                </div>
              </dl>
              <button
                onClick={goCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand"
              >
                {isAuthed ? t('cart.proceedToCheckout') : t('cart.loginToCheckout')}
                <ArrowRight size={16} />
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">{t('product.secureCheckout')}</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Clear confirmation */}
      {confirmClear && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setConfirmClear(false)}>
          <div className="fh-fade-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift dark:bg-ink-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">{t('cart.clear')}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('cart.clearConfirm')}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-ink-700"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleClear}
                className="flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                {t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart