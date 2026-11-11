import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2, Truck, CreditCard, Banknote, Loader2, ArrowLeft,
  ShoppingBag, MapPin, ChevronRight,
} from 'lucide-react'
import { orderApi, formatKyat } from '../services/baseApi.jsx'
import { deliveryFeeFor } from '../lib/catalog'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { selectCartItems, selectCartTotalAmount, fetchCartThunk } from '../features/cart/cartSlice.jsx'
import { selectUser } from '../features/auth/authSlice.jsx'
import { useToast } from '../hooks/useToast'
import ProductImage from '../components/ProductImage'
import EmptyState from '../components/EmptyState'

const FIELDS = ['recipientName', 'phone', 'address', 'township', 'city']

const Checkout = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const items = useAppSelector(selectCartItems)
  const subtotal = useAppSelector(selectCartTotalAmount)
  const user = useAppSelector(selectUser)

  const savedAddress = useMemo(() => {
    const list = user?.addresses || []
    return list.find((a) => a.isDefault) || list[0] || null
  }, [user])

  const [form, setForm] = useState(() => ({
    recipientName: savedAddress?.recipientName || user?.username || '',
    phone: savedAddress?.phone || user?.phone || '',
    address: savedAddress?.address || '',
    township: savedAddress?.township || '',
    city: savedAddress?.city || 'Yangon',
  }))
  const [notes, setNotes] = useState('')
  const [payment, setPayment] = useState('cod')
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState(null)

  const delivery = deliveryFeeFor(subtotal)
  const total = subtotal + delivery

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }))
  }

  const useSaved = () => {
    if (!savedAddress) return
    setForm({
      recipientName: savedAddress.recipientName || '',
      phone: savedAddress.phone || '',
      address: savedAddress.address || '',
      township: savedAddress.township || '',
      city: savedAddress.city || '',
    })
    setErrors({})
  }

  const validate = () => {
    const next = {}
    FIELDS.forEach((f) => {
      if (!String(form[f] || '').trim()) next[f] = t('checkout.required')
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error(t('checkout.required'))
      return
    }
    setPlacing(true)
    try {
      const data = await orderApi.create({
        shippingAddress: form,
        deliveryFee: delivery,
        discount: 0,
        notes,
        paymentMethod: payment,
      })
      setPlaced(data.order)
      dispatch(fetchCartThunk()) // server cleared the cart; reconcile local state
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      toast.error(err.message || t('checkout.placeError'))
    } finally {
      setPlacing(false)
    }
  }

  // Success screen
  if (placed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center md:px-8">
        <div className="fh-fade-up flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={44} strokeWidth={1.8} />
        </div>
        <h1 className="fh-fade-up mt-6 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          {t('checkout.success')}
        </h1>
        <p className="fh-fade-up mt-3 max-w-md text-gray-500 dark:text-gray-400">{t('checkout.successHint')}</p>
        <div className="fh-fade-up mt-6 rounded-2xl border border-gray-200 bg-white px-8 py-5 dark:border-gray-800 dark:bg-ink-800/50">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-gray-400">{t('checkout.orderNumber')}</p>
          <p className="mt-1 font-mono text-lg font-bold text-brand">{placed.orderNumber}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{formatKyat(placed.totalAmount)}</p>
        </div>
        <div className="fh-fade-up mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/orders"
            className="rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand"
          >
            {t('checkout.viewOrders')}
          </Link>
          <Link
            to="/shop"
            className="rounded-full border border-gray-300 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-gray-700 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-200"
          >
            {t('checkout.continueShopping')}
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <h1 className="mb-8 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white">
          {t('checkout.title')}
        </h1>
        <EmptyState
          icon={ShoppingBag}
          title={t('checkout.empty')}
          description={t('checkout.emptyHint')}
          actionLabel={t('cart.continueShopping')}
          actionTo="/shop"
        />
      </div>
    )
  }

  const inputClass = (key) =>
    `w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand dark:bg-ink-800 dark:text-white ${
      errors[key] ? 'border-brand' : 'border-gray-300 dark:border-gray-700'
    }`

  return (
    <div className="min-h-screen bg-porcelain dark:bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <nav className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-gray-400">
          <Link to="/cart" className="inline-flex items-center gap-1 transition-colors hover:text-brand">
            <ArrowLeft size={13} /> {t('checkout.backToCart')}
          </Link>
          <ChevronRight size={13} />
          <span className="text-gray-700 dark:text-gray-200">{t('checkout.title')}</span>
        </nav>

        <h1 className="mb-2 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
          {t('checkout.title')}
        </h1>
        <p className="mb-8 text-gray-500 dark:text-gray-400">{t('checkout.subtitle')}</p>

        <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {/* Shipping address */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-800/50">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 dark:text-white">
                  <MapPin size={20} className="text-brand" /> {t('checkout.shippingAddress')}
                </h2>
                {savedAddress && (
                  <button
                    type="button"
                    onClick={useSaved}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    {t('checkout.useProfileAddress')}
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('checkout.recipientName')}</label>
                  <input className={inputClass('recipientName')} value={form.recipientName} onChange={(e) => setField('recipientName', e.target.value)} />
                  {errors.recipientName && <p className="mt-1 text-xs text-brand">{errors.recipientName}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('checkout.phone')}</label>
                  <input className={inputClass('phone')} value={form.phone} onChange={(e) => setField('phone', e.target.value)} inputMode="tel" />
                  {errors.phone && <p className="mt-1 text-xs text-brand">{errors.phone}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('checkout.city')}</label>
                  <input className={inputClass('city')} value={form.city} onChange={(e) => setField('city', e.target.value)} />
                  {errors.city && <p className="mt-1 text-xs text-brand">{errors.city}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('checkout.address')}</label>
                  <input className={inputClass('address')} value={form.address} onChange={(e) => setField('address', e.target.value)} />
                  {errors.address && <p className="mt-1 text-xs text-brand">{errors.address}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('checkout.township')}</label>
                  <input className={inputClass('township')} value={form.township} onChange={(e) => setField('township', e.target.value)} />
                  {errors.township && <p className="mt-1 text-xs text-brand">{errors.township}</p>}
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-800/50">
              <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-bold text-gray-900 dark:text-white">
                <CreditCard size={20} className="text-brand" /> {t('checkout.paymentMethod')}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: 'cod', icon: Banknote, title: t('checkout.cod'), desc: t('checkout.codDesc') },
                  { id: 'paid', icon: CreditCard, title: t('checkout.paid'), desc: t('checkout.paidDesc') },
                ].map(({ id, icon: Icon, title, desc }) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPayment(id)}
                    className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                      payment === id
                        ? 'border-brand bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <Icon size={22} className={payment === id ? 'text-brand' : 'text-gray-400'} strokeWidth={1.8} />
                    <span>
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">{title}</span>
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('checkout.orderNotes')}</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('checkout.notesPlaceholder')}
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand dark:border-gray-700 dark:bg-ink-800 dark:text-white"
                />
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:h-max">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-ink-800/50">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{t('checkout.orderSummary')}</h2>
              <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
                    <div className="relative aspect-square w-14 shrink-0 overflow-hidden rounded-lg bg-porcelain-200 dark:bg-ink-700">
                      <ProductImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="truncate text-xs text-gray-400">{[item.color, item.size].filter(Boolean).join(' · ')}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatKyat(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <dl className="mt-5 space-y-3 border-t border-dashed border-gray-200 pt-5 text-sm dark:border-gray-700">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">{t('cart.subtotal')}</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{formatKyat(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"><Truck size={14} /> {t('checkout.deliveryFee')}</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">
                    {delivery === 0 ? <span className="text-emerald-600 dark:text-emerald-400">{t('cart.free')}</span> : formatKyat(delivery)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-dashed border-gray-200 pt-3 dark:border-gray-700">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">{t('cart.total')}</dt>
                  <dd className="font-display text-2xl font-black text-brand">{formatKyat(total)}</dd>
                </div>
              </dl>
              <button
                type="submit"
                disabled={placing}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 disabled:bg-gray-400"
              >
                {placing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                {placing ? t('checkout.placing') : t('checkout.placeOrder')}
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">{t('product.secureCheckout')}</p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  )
}

export default Checkout