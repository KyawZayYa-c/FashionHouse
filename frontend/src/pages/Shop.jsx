import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { catalogApi } from '../services/baseApi.jsx'
import { parsePrice } from '../services/baseApi.jsx'
import { totalStock } from '../lib/catalog'
import ProductCard from '../components/ProductCard'
import EmptyState from '../components/EmptyState'

const PAGE_SIZE = 9
const SORTS = ['newest', 'price-asc', 'price-desc', 'name']

const Shop = () => {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const category = params.get('category') || ''
  const search = params.get('search') || ''
  const sort = params.get('sort') || 'newest'
  const featuredOnly = params.get('featured') === 'true'
  const maxPrice = Number(params.get('max') || 0)

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value === '' || value === null || value === false) next.delete(key)
    else next.set(key, String(value))
    setParams(next, { replace: true })
    setPage(1)
  }

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [pData, cData] = await Promise.all([
        catalogApi.getProducts({ status: 'active', limit: 100 }),
        catalogApi.getCategories(),
      ])
      setProducts(pData.products || [])
      setCategories(cData.categories || [])
    } catch (err) {
      setError(err.message || t('shop.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const priceCeiling = useMemo(
    () => Math.max(10000, ...products.map((p) => parsePrice(p.price))),
    [products]
  )

  const counts = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      const cid = String(p.categoryId?._id || p.categoryId || '')
      map[cid] = (map[cid] || 0) + 1
    })
    return map
  }, [products])

  const filtered = useMemo(() => {
    let list = [...products]
    if (category) list = list.filter((p) => String(p.categoryId?._id || p.categoryId) === category)
    if (featuredOnly) list = list.filter((p) => p.isFeatured)
    if (maxPrice) list = list.filter((p) => parsePrice(p.price) <= maxPrice)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
        break
      case 'price-desc':
        list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
        break
      case 'name':
        list.sort((a, b) => a.productName.localeCompare(b.productName))
        break
      default:
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return list
  }, [products, category, featuredOnly, maxPrice, search, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const activeCategory = categories.find((c) => String(c._id) === category)
  const hasFilters = category || search || featuredOnly || maxPrice || sort !== 'newest'

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true })
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-porcelain dark:bg-ink">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-ink-900">
        <div className="aurora grain relative mx-auto max-w-7xl px-4 py-14 md:px-8">
          <nav className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-gray-400">
            <Link to="/" className="transition-colors hover:text-brand">{t('nav.home')}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-200">{t('shop.title')}</span>
          </nav>
          <h1 className="font-display text-4xl font-black tracking-tight text-gray-900 dark:text-white md:text-6xl">
            {activeCategory ? activeCategory.categoryName : t('shop.title')}
          </h1>
          <p className="mt-3 max-w-xl text-gray-500 dark:text-gray-400">
            {t('shop.subtitle')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        {/* Toolbar */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setParam('search', e.target.value)}
              placeholder={t('shop.searchPlaceholder')}
              className="w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-brand dark:border-gray-700 dark:bg-ink-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-200 lg:hidden"
            >
              <SlidersHorizontal size={16} /> {t('shop.filters')}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">{t('shop.sortBy')}</span>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                className="rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-brand dark:border-gray-700 dark:bg-ink-800 dark:text-white"
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>{t(`shop.sort.${s}`)}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Sidebar */}
          <aside
            className={`${
              filtersOpen ? 'block' : 'hidden'
            } w-full shrink-0 lg:block lg:w-64`}
          >
            <div className="sticky top-24 space-y-8">
              <div>
                <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  {t('shop.categories')}
                </h2>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setParam('category', '')}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        !category ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-ink-800'
                      }`}
                    >
                      <span>{t('shop.allProducts')}</span>
                      <span className="text-xs opacity-70">{products.length}</span>
                    </button>
                  </li>
                  {categories.map((c) => (
                    <li key={c._id}>
                      <button
                        onClick={() => setParam('category', String(c._id))}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                          category === String(c._id)
                            ? 'bg-brand text-white'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-ink-800'
                        }`}
                      >
                        <span>{c.categoryName}</span>
                        <span className="text-xs opacity-70">{counts[String(c._id)] || 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  {t('shop.maxPrice')}
                </h2>
                <input
                  type="range"
                  min={0}
                  max={priceCeiling}
                  step={5000}
                  value={maxPrice || priceCeiling}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    setParam('max', v >= priceCeiling ? '' : v)
                  }}
                  className="w-full accent-brand"
                />
                <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0 Ks</span>
                  <span className="font-semibold text-brand">
                    {(maxPrice || priceCeiling).toLocaleString('en-US')} Ks
                  </span>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setParam('featured', e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Sparkles size={15} className="text-gold" /> {t('shop.featuredOnly')}
                </span>
              </label>

              {hasFilters && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
                >
                  <X size={15} /> {t('shop.clearFilters')}
                </button>
              )}
            </div>
          </aside>

          {/* Grid */}
          <main className="flex-1">
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              {t('shop.showing', { count: filtered.length })}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="fh-skeleton aspect-[4/5] rounded-xl" />
                    <div className="fh-skeleton mt-4 h-4 w-1/3 rounded" />
                    <div className="fh-skeleton mt-2 h-5 w-2/3 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon={X}
                title={t('shop.loadError')}
                description={error}
                actionLabel={t('common.retry')}
                onAction={load}
              />
            ) : pageItems.length === 0 ? (
              <EmptyState
                icon={Search}
                title={t('shop.noResults')}
                description={t('shop.noResultsHint')}
                actionLabel={t('shop.clearFilters')}
                onAction={clearAll}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {pageItems.map((p, i) => (
                    <ProductCard key={p._id} product={p} index={i} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-brand hover:text-brand disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                      aria-label={t('common.previous')}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                          safePage === i + 1
                            ? 'bg-brand text-white'
                            : 'border border-gray-300 text-gray-600 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-brand hover:text-brand disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                      aria-label={t('common.next')}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Shop