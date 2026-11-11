import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { addToCartThunk } from '../features/cart/cartSlice.jsx'
import { toggleWishlistThunk, selectIsWishlisted } from '../features/wishlist/wishlistSlice.jsx'
import { useToast } from '../hooks/useToast'
import { formatKyat } from '../services/baseApi.jsx'
import { productImage, productHref, totalStock, firstAvailableVariant, uniqueValues } from '../lib/catalog'
import ProductImage from './ProductImage'

const ProductCard = ({ product, index = 0 }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const id = String(product._id || product.id)
  const wishlisted = useAppSelector(selectIsWishlisted(id))
  const [adding, setAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const stock = totalStock(product)
  const soldOut = stock <= 0
  const lowStock = stock > 0 && stock <= 10
  const colors = uniqueValues(product.variants, 'color')

  const handleAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (soldOut || adding) return
    setAdding(true)
    const variant = firstAvailableVariant(product)
    try {
      await dispatch(addToCartThunk({ product, variant, quantity: 1 })).unwrap()
      setJustAdded(true)
      toast.success(t('product.addedToCart', { name: product.productName }))
      setTimeout(() => setJustAdded(false), 1600)
    } catch (err) {
      toast.error(typeof err === 'string' ? err : t('product.addFailed'))
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const res = await dispatch(toggleWishlistThunk(product)).unwrap()
    toast[res?.added ? 'success' : 'info'](
      res?.added ? t('product.addedToWishlist') : t('product.removedFromWishlist')
    )
  }

  return (
    <article
      className="group fh-fade-up relative flex flex-col"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <Link
        to={productHref(product)}
        className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-porcelain-200 dark:bg-ink-800"
      >
        <ProductImage
          src={productImage(product)}
          alt={product.productName}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut ? (
            <span className="rounded-sm bg-ink/85 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              {t('product.soldOut')}
            </span>
          ) : product.isFeatured ? (
            <span className="rounded-sm bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
              {t('product.featured')}
            </span>
          ) : null}
          {lowStock && !soldOut && (
            <span className="rounded-sm bg-magenta px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {t('product.lowStock')}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wishlisted ? t('product.removeWishlist') : t('product.addWishlist')}
          aria-pressed={wishlisted}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all ${
            wishlisted
              ? 'bg-magenta text-white shadow-glow'
              : 'bg-white/85 text-gray-700 hover:bg-white hover:text-magenta dark:bg-ink/70 dark:text-gray-200'
          }`}
        >
          <Heart size={17} strokeWidth={2} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick add (reveals on hover, always visible on touch) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-lg:translate-y-0 max-lg:opacity-100">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || adding}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold uppercase tracking-wider shadow-lift transition-colors ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-ink text-white hover:bg-brand disabled:bg-gray-400'
            }`}
          >
            {justAdded ? <Check size={15} strokeWidth={2.5} /> : <ShoppingBag size={15} strokeWidth={2} />}
            {soldOut ? t('product.soldOut') : justAdded ? t('product.added') : t('product.quickAdd')}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-4 flex flex-1 flex-col">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
          {product.brand || t('product.houseLabel')}
        </p>
        <Link
          to={productHref(product)}
          className="mt-1 font-display text-lg font-semibold leading-snug text-gray-900 transition-colors hover:text-brand dark:text-white"
        >
          {product.productName}
        </Link>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {formatKyat(product.price)}
          </span>
          {colors.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              · {t('product.colorCount', { count: colors.length })}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard