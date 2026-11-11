import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, ShoppingBag, Trash2, X, ChevronRight, Loader2, Check } from 'lucide-react'
import { catalogApi, formatKyat } from '../services/baseApi.jsx'
import { firstAvailableVariant, totalStock } from '../lib/catalog'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import {
  selectWishlistItems, removeFromWishlistThunk, clearWishlistThunk,
} from '../features/wishlist/wishlistSlice.jsx'
import { addToCartThunk } from '../features/cart/cartSlice.jsx'
import { useToast } from '../hooks/useToast'
import ProductImage from '../components/ProductImage'
import EmptyState from '../components/EmptyState'

const Wishlist = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const items = useAppSelector(selectWishlistItems)
  const [busyId, setBusyId] = useState(null)
  const [addedId, setAddedId] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleMove = async (item) => {
    if (busyId) return
    setBusyId(item.productId)
    try {
      const data = await catalogApi.getBySlug(item.slug)
      const product = data.product
      if (totalStock(product) <= 0) {
        toast.warning(t('product.outOfStock'))
        return
      }
      const variant = firstAvailableVariant(product)
      await dispatch(addToCartThunk({ product, variant, quantity: 1 })).unwrap()
      await dispatch(removeFromWishlistThunk(item.productId)).unwrap()
      setAddedId(item.productId)
      toast.success(t('wishlist.addedToCart'))
      setTimeout(() => setAddedId(null), 1500)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : t('product.addFailed'))
    } finally {
      setBusyId(null)
    }
  }

  const handleRemove = (item) => {
    dispatch(removeFromWishlistThunk(item.productId))
    toast.info(t('wishlist.removed'))
  }

  const handleClear = () => {
    dispatch(clearWishlistThunk())
    setConfirmClear(false)
    toast.info(t('wishlist.cleared'))
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <h1 className="mb-8 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          {t('wishlist.title')}
        </h1>
        <EmptyState
          icon={Heart}
          title={t('wishlist.empty')}
          description={t('wishlist.emptyHint')}
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
          <span className="text-gray-700 dark:text-gray-200">{t('wishlist.title')}</span>
        </nav>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {t('wishlist.title')}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('wishlist.count', { count: items.length })}</p>
          </div>
          <button
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-brand dark:text-gray-400"
          >
            <Trash2 size={15} /> {t('wishlist.clear')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, i) => (
            <article
              key={item.productId}
              className="group fh-fade-up flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-ink-800/50"
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-porcelain-200 dark:bg-ink-700">
                <Link to={`/product/${item.slug}`}>
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                <button
                  onClick={() => handleRemove(item)}
                  aria-label={t('wishlist.remove')}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-gray-600 backdrop-blur transition-colors hover:bg-white hover:text-brand dark:bg-ink/70 dark:text-gray-200"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <Link
                  to={`/product/${item.slug}`}
                  className="font-display text-lg font-semibold leading-snug text-gray-900 transition-colors hover:text-brand dark:text-white"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-base font-bold text-gray-900 dark:text-white">{formatKyat(item.price)}</p>
                <button
                  onClick={() => handleMove(item)}
                  disabled={busyId === item.productId}
                  className={`mt-4 flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                    addedId === item.productId
                      ? 'bg-emerald-600 text-white'
                      : 'bg-ink text-white hover:bg-brand disabled:bg-gray-400'
                  }`}
                >
                  {busyId === item.productId ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : addedId === item.productId ? (
                    <Check size={15} strokeWidth={2.5} />
                  ) : (
                    <ShoppingBag size={15} />
                  )}
                  {t('wishlist.moveToCart')}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {confirmClear && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setConfirmClear(false)}>
          <div className="fh-fade-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift dark:bg-ink-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">{t('wishlist.clear')}</h3>
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

export default Wishlist