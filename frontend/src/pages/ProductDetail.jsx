import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Heart, ShoppingBag, Check, ChevronRight, Truck, ShieldCheck, RotateCcw,
  Share2, Loader2, ArrowLeft, Minus, Plus,
} from 'lucide-react'
import { catalogApi, formatKyat } from '../services/baseApi.jsx'
import {
  productImage, totalStock, firstAvailableVariant, effectivePrice,
  uniqueValues, colorSwatch, isLightColor,
} from '../lib/catalog'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { addToCartThunk } from '../features/cart/cartSlice.jsx'
import { toggleWishlistThunk, selectIsWishlisted } from '../features/wishlist/wishlistSlice.jsx'
import { selectIsAuthenticated } from '../features/auth/authSlice.jsx'
import { useToast } from '../hooks/useToast'
import ProductImage from '../components/ProductImage'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'

const ProductDetail = () => {
  const { slug } = useParams()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const isAuthed = useAppSelector(selectIsAuthenticated)

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const id = product ? String(product._id) : ''
  const wishlisted = useAppSelector(selectIsWishlisted(id))

  useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setError(null)
      setProduct(null)
      window.scrollTo({ top: 0, behavior: 'auto' })
      try {
        const data = await catalogApi.getBySlug(slug)
        if (!alive) return
        const p = data.product
        setProduct(p)
        const first = firstAvailableVariant(p)
        setSize(first?.size || '')
        setColor(first?.color || '')
        setActiveImage(0)
        setQty(1)
        // Related pieces from the same category.
        try {
          const cat = String(p.categoryId?._id || p.categoryId || '')
          const rel = await catalogApi.getProducts({ status: 'active', limit: 100 })
          if (!alive) return
          setRelated(
            (rel.products || [])
              .filter((r) => String(r._id) !== String(p._id))
              .filter((r) => !cat || String(r.categoryId?._id || r.categoryId) === cat)
              .slice(0, 4)
          )
        } catch {
          /* related is a nice-to-have */
        }
      } catch (err) {
        if (alive) setError(err.message || t('product.notFound'))
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const sizes = useMemo(() => uniqueValues(product?.variants, 'size'), [product])
  const colors = useMemo(() => uniqueValues(product?.variants, 'color'), [product])
  const showSize = sizes.length > 1
  const showColor = colors.length > 1

  const selectedVariant = useMemo(() => {
    if (!product) return null
    return (
      product.variants.find((v) => v.size === size && v.color === color) ||
      product.variants.find((v) => v.size === size) ||
      firstAvailableVariant(product)
    )
  }, [product, size, color])

  const stock = selectedVariant ? Number(selectedVariant.stock) || 0 : totalStock(product)
  const soldOut = stock <= 0
  const price = product ? effectivePrice(product, selectedVariant) : 0
  const images = product?.images?.length ? product.images : [{ url: productImage(product) }]

  // When a size changes, keep the colour if that combo exists, else pick the first.
  const pickSize = (s) => {
    setSize(s)
    const combo = product.variants.find((v) => v.size === s && v.color === color)
    if (!combo) {
      const alt = product.variants.find((v) => v.size === s)
      if (alt) setColor(alt.color)
    }
    setQty(1)
  }
  const pickColor = (c) => {
    setColor(c)
    const combo = product.variants.find((v) => v.size === size && v.color === c)
    if (!combo) {
      const alt = product.variants.find((v) => v.color === c)
      if (alt) setSize(alt.size)
    }
    setQty(1)
  }

  const handleAdd = async (buyNow = false) => {
    if (soldOut || adding) return
    setAdding(true)
    try {
      await dispatch(addToCartThunk({ product, variant: selectedVariant, quantity: qty })).unwrap()
      setJustAdded(true)
      toast.success(t('product.addedToCart', { name: product.productName }))
      setTimeout(() => setJustAdded(false), 1600)
      if (buyNow) navigate(isAuthed ? '/checkout' : '/login')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : t('product.addFailed'))
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async () => {
    const res = await dispatch(toggleWishlistThunk(product)).unwrap()
    toast[res?.added ? 'success' : 'info'](
      res?.added ? t('product.addedToWishlist') : t('product.removedFromWishlist')
    )
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: product.productName, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success(t('product.linkCopied'))
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="fh-skeleton aspect-[4/5] rounded-2xl" />
          <div className="space-y-5 py-4">
            <div className="fh-skeleton h-4 w-24 rounded" />
            <div className="fh-skeleton h-10 w-3/4 rounded" />
            <div className="fh-skeleton h-8 w-40 rounded" />
            <div className="fh-skeleton h-24 w-full rounded" />
            <div className="fh-skeleton h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <EmptyState
          icon={ShoppingBag}
          title={t('product.notFound')}
          description={error || t('product.notFoundHint')}
          actionLabel={t('product.backToShop')}
          actionTo="/shop"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-porcelain dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-gray-400">
          <Link to="/" className="transition-colors hover:text-brand">{t('nav.home')}</Link>
          <ChevronRight size={13} />
          <Link to="/shop" className="transition-colors hover:text-brand">{t('nav.shop')}</Link>
          <ChevronRight size={13} />
          <span className="truncate text-gray-700 dark:text-gray-200">{product.productName}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="fh-fade-up">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-porcelain-200 dark:bg-ink-800">
              <ProductImage
                src={images[activeImage]?.url || productImage(product)}
                alt={product.productName}
                className="h-full w-full object-cover"
              />
              {product.isFeatured && (
                <span className="absolute left-4 top-4 rounded-sm bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
                  {t('product.featured')}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                      activeImage === i ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <ProductImage src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info / purchase */}
          <div className="fh-fade-up flex flex-col" style={{ animationDelay: '80ms' }}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
              {product.brand || t('product.houseLabel')}
            </p>
            <h1 className="mt-2 font-display text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {product.productName}
            </h1>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatKyat(price)}</span>
              {soldOut ? (
                <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {t('product.outOfStock')}
                </span>
              ) : stock <= 10 ? (
                <span className="rounded-full bg-magenta/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-magenta">
                  {t('product.onlyLeft', { count: stock })}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t('product.inStock')}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-5 max-w-prose leading-relaxed text-gray-600 dark:text-gray-300">
                {product.description}
              </p>
            )}

            {/* Colour selector */}
            {showColor && (
              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                    {t('product.selectColor')}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{color}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {colors.map((c) => {
                    const available = product.variants.some((v) => v.color === c && Number(v.stock) > 0 && (!showSize || v.size === size))
                    const active = color === c
                    return (
                      <button
                        key={c}
                        onClick={() => pickColor(c)}
                        title={c}
                        aria-label={c}
                        aria-pressed={active}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          active ? 'border-brand scale-110' : 'border-gray-200 hover:border-gray-400 dark:border-gray-700'
                        } ${!available ? 'opacity-40' : ''}`}
                        style={{ backgroundColor: colorSwatch(c) }}
                      >
                        {active && (
                          <Check size={16} strokeWidth={3} className={isLightColor(c) ? 'text-ink' : 'text-white'} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {showSize && (
              <div className="mt-6">
                <span className="mb-3 block font-mono text-xs font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
                  {t('product.selectSize')}
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map((s) => {
                    const available = product.variants.some((v) => v.size === s && Number(v.stock) > 0 && (!showColor || v.color === color))
                    const active = size === s
                    return (
                      <button
                        key={s}
                        onClick={() => pickSize(s)}
                        aria-pressed={active}
                        className={`min-w-[3rem] rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                          active
                            ? 'border-brand bg-brand text-white'
                            : 'border-gray-300 text-gray-700 hover:border-brand dark:border-gray-700 dark:text-gray-200'
                        } ${!available ? 'opacity-40 line-through' : ''}`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity + actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-gray-300 bg-white dark:border-gray-700 dark:bg-ink-800">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="flex h-12 w-12 items-center justify-center text-gray-600 transition-colors hover:text-brand disabled:opacity-40 dark:text-gray-300"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} strokeWidth={2.2} />
                </button>
                <span className="min-w-[2.5rem] text-center text-base font-semibold tabular-nums text-gray-900 dark:text-white" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="flex h-12 w-12 items-center justify-center text-gray-600 transition-colors hover:text-brand disabled:opacity-40 dark:text-gray-300"
                  disabled={qty >= Math.max(1, stock)}
                  onClick={() => setQty((q) => Math.min(Math.max(1, stock), q + 1))}
                >
                  <Plus size={16} strokeWidth={2.2} />
                </button>
              </div>
              {selectedVariant?.sku && (
                <span className="font-mono text-xs text-gray-400">{t('product.sku')}: {selectedVariant.sku}</span>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleAdd(false)}
                disabled={soldOut || adding}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-sm font-bold uppercase tracking-wider shadow-lift transition-colors ${
                  justAdded ? 'bg-emerald-600 text-white' : 'bg-ink text-white hover:bg-brand disabled:bg-gray-400'
                }`}
              >
                {adding ? <Loader2 size={18} className="animate-spin" /> : justAdded ? <Check size={18} strokeWidth={2.5} /> : <ShoppingBag size={18} />}
                {soldOut ? t('product.soldOut') : adding ? t('product.adding') : justAdded ? t('product.added') : t('product.addToCart')}
              </button>
              <button
                type="button"
                onClick={() => handleAdd(true)}
                disabled={soldOut || adding}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 disabled:bg-gray-400"
              >
                {t('product.buyNow')}
              </button>
              <button
                type="button"
                onClick={handleWishlist}
                aria-pressed={wishlisted}
                aria-label={wishlisted ? t('product.removeWishlist') : t('product.addWishlist')}
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                  wishlisted
                    ? 'border-magenta bg-magenta text-white'
                    : 'border-gray-300 text-gray-600 hover:border-magenta hover:text-magenta dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="mt-4 inline-flex w-max items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-brand dark:text-gray-400"
            >
              <Share2 size={15} /> {t('product.share')}
            </button>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white/60 p-5 dark:border-gray-800 dark:bg-ink-800/40 sm:grid-cols-3">
              {[
                { icon: Truck, label: t('product.freeShipping') },
                { icon: ShieldCheck, label: t('product.secureCheckout') },
                { icon: RotateCcw, label: t('product.easyReturns') },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <Icon size={18} className="shrink-0 text-brand" strokeWidth={1.8} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
                {t('product.relatedProducts')}
              </h2>
              <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                {t('common.viewAll')} <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductDetail