import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight, ArrowUpRight, Truck, ShieldCheck, RotateCcw, Headphones,
  Sparkles, Mail, Check, Loader2,
} from 'lucide-react'
import { catalogApi } from '../services/baseApi.jsx'
import { productImage } from '../lib/catalog'
import { useToast } from '../hooks/useToast'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'
const EDITORIAL_IMAGE =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'

const Home = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const [f, c, p] = await Promise.all([
          catalogApi.getFeatured(8),
          catalogApi.getCategories(),
          catalogApi.getProducts({ status: 'active', limit: 100 }),
        ])
        if (!alive) return
        setFeatured(f.products || [])
        setCategories(c.categories || [])
        setProducts(p.products || [])
      } catch {
        if (alive) toast.error(t('home.loadError'))
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A representative image per category, drawn from the live catalog.
  const categoryTiles = useMemo(() => {
    return categories.slice(0, 6).map((c) => {
      const match = products.find(
        (p) => String(p.categoryId?._id || p.categoryId) === String(c._id)
      )
      return { ...c, image: match ? productImage(match) : null }
    })
  }, [categories, products])

  const brandCount = useMemo(
    () => new Set(products.map((p) => p.brand).filter(Boolean)).size,
    [products]
  )

  const subscribe = (e) => {
    e.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!valid) {
      toast.error(t('newsletter.invalid'))
      return
    }
    setSubscribing(true)
    setTimeout(() => {
      setSubscribing(false)
      setSubscribed(true)
      setEmail('')
      toast.success(t('newsletter.success'))
    }, 700)
  }

  const marqueeItems = [t('home.marquee1'), t('home.marquee2'), t('home.marquee3'), t('home.marquee4')]
  const valueProps = [
    { icon: ShieldCheck, title: t('home.securePayment'), sub: t('home.securePaymentSub') },
    { icon: RotateCcw, title: t('home.return30'), sub: t('home.return30Sub') },
    { icon: Headphones, title: t('home.support247'), sub: t('home.support247Sub') },
    { icon: Truck, title: t('home.freeDelivery'), sub: t('home.freeDeliverySub') },
  ]
  const stats = [
    { value: `${products.length || 14}+`, label: t('home.statProducts') },
    { value: '2.4k+', label: t('home.statCustomers') },
    { value: `${brandCount || 8}`, label: t('home.statBrands') },
    { value: '30+', label: t('home.statDelivery') },
  ]

  return (
    <div className="bg-porcelain dark:bg-ink">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="aurora grain absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-8 lg:grid-cols-2 lg:py-24">
          <div className="fh-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/5 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-brand">
              <Sparkles size={13} /> {t('home.heroTag')}
            </span>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight text-gray-900 dark:text-white md:text-7xl">
              {t('home.heroTitle1')}
              <br />
              <span className="text-gradient">{t('home.heroTitle2')}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-300">
              {t('home.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lift transition-colors hover:bg-brand"
              >
                {t('home.shopCollection')}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-8 py-4 text-sm font-bold uppercase tracking-wider text-gray-800 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-200"
              >
                {t('home.editorialCta')}
              </Link>
            </div>
          </div>
          <div className="fh-fade-up relative" style={{ animationDelay: '120ms' }}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
              <ProductImage src={HERO_IMAGE} alt="Fashion House editorial" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-gray-200 bg-white/90 px-6 py-4 shadow-card backdrop-blur dark:border-gray-700 dark:bg-ink-800/90 sm:block">
              <p className="font-display text-3xl font-black text-brand">{products.length || 14}+</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">{t('home.statProducts')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-gray-200 bg-ink py-4 text-white dark:border-gray-800">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-white/80">
                <Sparkles size={13} className="text-gold" /> {item}
              </span>
            ))}
          </div>
          <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12" aria-hidden="true">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-3 whitespace-nowrap font-mono text-xs uppercase tracking-[0.2em] text-white/80">
                <Sparkles size={13} className="text-gold" /> {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">{t('home.checkLatest')}</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {t('home.featured')}
            </h2>
            <p className="mt-3 max-w-md text-gray-500 dark:text-gray-400">{t('home.featuredSubtitle')}</p>
          </div>
          <Link
            to="/shop?featured=true"
            className="group inline-flex items-center gap-2 border-b-2 border-brand pb-1 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white"
          >
            {t('home.viewAll')}
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="fh-skeleton aspect-[4/5] rounded-xl" />
                <div className="fh-skeleton mt-4 h-4 w-1/3 rounded" />
                <div className="fh-skeleton mt-2 h-5 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featured.slice(0, 8).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">{t('home.categoriesSubtitle')}</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {t('home.categoriesTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categoryTiles.map((c, i) => (
              <Link
                key={c._id}
                to={`/shop?category=${c._id}`}
                className="group fh-fade-up relative aspect-[3/4] overflow-hidden rounded-2xl bg-porcelain-200 dark:bg-ink-800"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {c.image && (
                  <ProductImage src={c.image} alt={c.categoryName} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-lg font-bold text-white">{c.categoryName}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold opacity-0 transition-opacity group-hover:opacity-100">
                    {t('home.shopNow')} <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-lift">
            <ProductImage src={EDITORIAL_IMAGE} alt="The atelier" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand">{t('home.editorialTag')}</p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl">
              {t('home.editorialTitle')}
            </h2>
            <p className="mt-5 max-w-prose leading-relaxed text-gray-600 dark:text-gray-300">
              {t('home.editorialText')}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="border-l-2 border-brand pl-4">
                  <p className="font-display text-3xl font-black text-gray-900 dark:text-white">{s.value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand"
            >
              {t('home.editorialCta')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
          {valueProps.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-gold">
                <Icon size={26} strokeWidth={1.6} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-white/60">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="relative overflow-hidden">
        <div className="aurora grain absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
            <Mail size={24} strokeWidth={1.8} />
          </div>
          <h2 className="mt-6 font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-5xl">
            {t('newsletter.title')}
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{t('newsletter.subtitle')}</p>
          {subscribed ? (
            <div className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <Check size={18} strokeWidth={2.5} /> {t('newsletter.success')}
            </div>
          ) : (
            <form onSubmit={subscribe} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                className="flex-1 rounded-full border border-gray-300 bg-white px-6 py-3.5 text-sm text-gray-900 outline-none transition-colors focus:border-brand dark:border-gray-700 dark:bg-ink-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 disabled:bg-gray-400"
              >
                {subscribing ? <Loader2 size={16} className="animate-spin" /> : null}
                {t('newsletter.button')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home