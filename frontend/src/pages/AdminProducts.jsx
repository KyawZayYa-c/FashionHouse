import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Pencil, Trash2, X, Star, Package, AlertCircle, Loader2, ImageIcon, Trash,
} from 'lucide-react'
import { catalogApi, formatKyat, parsePrice } from '../services/baseApi.jsx'
import { totalStock, productImage } from '../lib/catalog'
import ProductImage from '../components/ProductImage'
import EmptyState from '../components/EmptyState'
import { useToast } from '../hooks/useToast'

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

const emptyVariant = () => ({ sku: '', size: '', color: '', stock: 0, additionalPrice: 0 })

const blankForm = () => ({
  productName: '', slug: '', brand: '', description: '', price: '',
  categoryId: '', status: 'active', isFeatured: false, images: '', variants: [emptyVariant()],
})

const ProductForm = ({ initial, categories, onClose, onSaved }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const isEdit = Boolean(initial?._id)
  const [form, setForm] = useState(() => {
    if (!initial) return blankForm()
    return {
      productName: initial.productName || '',
      slug: initial.slug || '',
      brand: initial.brand || '',
      description: initial.description || '',
      price: String(parsePrice(initial.price)),
      categoryId: String(initial.categoryId?._id || initial.categoryId || ''),
      status: initial.status || 'active',
      isFeatured: Boolean(initial.isFeatured),
      images: (initial.images || []).map((im) => im.url).join('\n'),
      variants: (initial.variants || []).length
        ? initial.variants.map((v) => ({
            sku: v.sku || '', size: v.size || '', color: v.color || '',
            stock: Number(v.stock) || 0, additionalPrice: parsePrice(v.additionalPrice),
          }))
        : [emptyVariant()],
    }
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [slugTouched, setSlugTouched] = useState(isEdit)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setName = (value) => setForm((f) => ({ ...f, productName: value, slug: slugTouched ? f.slug : slugify(value) }))

  const setVariant = (i, key, value) =>
    setForm((f) => ({ ...f, variants: f.variants.map((v, idx) => (idx === i ? { ...v, [key]: value } : v)) }))
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }))
  const removeVariant = (i) => setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))

  const validate = () => {
    const e = {}
    if (!form.productName.trim()) e.productName = t('checkout.required')
    if (!form.slug.trim()) e.slug = t('checkout.required')
    if (!form.categoryId) e.categoryId = t('checkout.required')
    if (form.price === '' || Number(form.price) < 0) e.price = t('checkout.required')
    if (!form.variants.length || form.variants.some((v) => !v.sku.trim() || !v.size.trim() || !v.color.trim())) {
      e.variants = t('checkout.required')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    const body = {
      categoryId: form.categoryId,
      productName: form.productName.trim(),
      slug: slugify(form.slug),
      description: form.description.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      status: form.status,
      isFeatured: form.isFeatured,
      images: form.images.split('\n').map((u) => u.trim()).filter(Boolean).map((url, i) => ({ url, isPrimary: i === 0 })),
      variants: form.variants.map((v) => ({
        sku: v.sku.trim(), size: v.size.trim(), color: v.color.trim(),
        stock: Number(v.stock) || 0, additionalPrice: Number(v.additionalPrice) || 0,
      })),
    }
    try {
      const data = isEdit ? await catalogApi.update(initial._id, body) : await catalogApi.create(body)
      toast.success(isEdit ? t('admin.products.updated') : t('admin.products.created'))
      onSaved(data.product, isEdit)
    } catch (err) {
      toast.error(err.message || t('admin.loadError'))
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-brand dark:border-gray-700 dark:bg-gray-900 dark:text-white'
  const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400'

  return (
    <div className="fixed inset-0 z-[90] flex justify-end bg-ink/50 backdrop-blur-sm" onClick={() => !saving && onClose()}>
      <div className="fh-slide-in flex h-full w-full max-w-2xl flex-col bg-porcelain shadow-2xl dark:bg-ink" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
            {isEdit ? t('admin.products.edit') : t('admin.products.add')}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label={t('common.close')}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>{t('admin.products.form.name')} *</label>
              <input className={inputCls} value={form.productName} onChange={(e) => setName(e.target.value)} />
              {errors.productName && <p className="mt-1 text-xs text-brand">{errors.productName}</p>}
            </div>
            <div>
              <label className={labelCls}>{t('admin.products.form.slug')} *</label>
              <input className={inputCls} value={form.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value) }} />
              <p className="mt-1 text-[11px] text-gray-400">{t('admin.products.form.slugHint')}</p>
              {errors.slug && <p className="mt-1 text-xs text-brand">{errors.slug}</p>}
            </div>
            <div>
              <label className={labelCls}>{t('admin.products.form.brand')}</label>
              <input className={inputCls} value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>{t('admin.products.form.category')} *</label>
              <select className={inputCls} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                <option value="">{t('admin.products.form.noCategory')}</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-brand">{errors.categoryId}</p>}
            </div>
            <div>
              <label className={labelCls}>{t('admin.products.form.price')} *</label>
              <input type="number" min="0" className={inputCls} value={form.price} onChange={(e) => set('price', e.target.value)} />
              {errors.price && <p className="mt-1 text-xs text-brand">{errors.price}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t('admin.products.form.description')}</label>
              <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}><ImageIcon size={13} className="mr-1 inline" />{t('admin.products.form.images')}</label>
            <textarea rows={3} className={`${inputCls} font-mono text-xs`} value={form.images} onChange={(e) => set('images', e.target.value)} placeholder="https://…" />
            <p className="mt-1 text-[11px] text-gray-400">{t('admin.products.form.imageHint')}</p>
          </div>

          {/* Variants */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelCls}>{t('admin.products.form.variants')} *</label>
              <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
                <Plus size={14} /> {t('admin.products.form.addVariant')}
              </button>
            </div>
            {errors.variants && <p className="mb-2 text-xs text-brand">{errors.variants}</p>}
            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <input className={inputCls} placeholder={t('admin.products.form.size')} value={v.size} onChange={(e) => setVariant(i, 'size', e.target.value)} />
                    <input className={inputCls} placeholder={t('admin.products.form.color')} value={v.color} onChange={(e) => setVariant(i, 'color', e.target.value)} />
                    <input className={inputCls} placeholder={t('admin.products.form.sku')} value={v.sku} onChange={(e) => setVariant(i, 'sku', e.target.value)} />
                    <input type="number" min="0" className={inputCls} placeholder={t('admin.products.form.stock')} value={v.stock} onChange={(e) => setVariant(i, 'stock', e.target.value)} />
                    <input type="number" min="0" className={inputCls} placeholder={t('admin.products.form.additionalPrice')} value={v.additionalPrice} onChange={(e) => setVariant(i, 'additionalPrice', e.target.value)} />
                    <button type="button" onClick={() => removeVariant(i)} disabled={form.variants.length === 1} className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 text-xs font-semibold text-gray-500 transition-colors hover:border-brand hover:text-brand disabled:opacity-40 dark:border-gray-700">
                      <Trash size={14} /> {t('admin.products.form.removeVariant')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status + featured */}
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className={labelCls}>{t('admin.products.form.status')}</label>
              <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="active">{t('admin.products.active')}</option>
                <option value="inactive">{t('admin.products.inactive')}</option>
              </select>
            </div>
            <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input type="checkbox" className="h-4 w-4 accent-brand" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
              <Star size={15} className="text-gold" /> {t('admin.products.form.featured')}
            </label>
          </div>
        </form>

        <div className="flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200">
            {t('admin.products.form.cancel')}
          </button>
          <button onClick={submit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-60">
            {saving ? <><Loader2 size={16} className="animate-spin" /> {t('admin.products.form.saving')}</> : (isEdit ? t('admin.products.form.update') : t('admin.products.form.create'))}
          </button>
        </div>
      </div>
    </div>
  )
}

const AdminProducts = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // product object or 'new'
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [pData, cData] = await Promise.all([
        catalogApi.getProducts({ limit: 200 }),
        catalogApi.getCategories(),
      ])
      setProducts(pData.products || [])
      setCategories(cData.categories || [])
    } catch (err) {
      setError(err.message || t('admin.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const catName = (p) => {
    const id = String(p.categoryId?._id || p.categoryId || '')
    return categories.find((c) => String(c._id) === id)?.categoryName || t('admin.products.form.noCategory')
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.productName?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q))
  }, [products, search])

  const handleSaved = (product, isEdit) => {
    setProducts((prev) => (isEdit ? prev.map((p) => (p._id === product._id ? product : p)) : [product, ...prev]))
    setEditing(null)
  }

  const handleDelete = async () => {
    const target = confirmDelete
    setConfirmDelete(null)
    // Optimistic: mark inactive immediately.
    setProducts((prev) => prev.map((p) => (p._id === target._id ? { ...p, status: 'inactive' } : p)))
    try {
      await catalogApi.remove(target._id)
      toast.success(t('admin.products.deleted'))
    } catch (err) {
      setProducts((prev) => prev.map((p) => (p._id === target._id ? target : p)))
      toast.error(err.message || t('admin.loadError'))
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">{t('admin.products.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('admin.products.subtitle')}</p>
        </div>
        <button onClick={() => setEditing('new')} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
          <Plus size={16} /> {t('admin.products.add')}
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.products.search')} className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fh-skeleton h-16 rounded-xl" />)}</div>
      ) : error ? (
        <EmptyState icon={AlertCircle} title={t('admin.loadError')} description={error} actionLabel={t('admin.retry')} onAction={load} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title={t('admin.products.empty')} actionLabel={t('admin.products.add')} onAction={() => setEditing('new')} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('admin.products.name')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.products.category')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.products.price')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.products.stock')}</th>
                  <th className="px-4 py-3 font-semibold">{t('admin.products.status')}</th>
                  <th className="px-4 py-3 text-right font-semibold">{t('admin.products.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {filtered.map((p) => {
                  const stock = totalStock(p)
                  return (
                    <tr key={p._id} className="transition-colors hover:bg-gray-50/60 dark:hover:bg-gray-900/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <ProductImage src={productImage(p)} alt={p.productName} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                              <span className="truncate">{p.productName}</span>
                              {p.isFeatured && <Star size={13} className="shrink-0 fill-gold text-gold" />}
                            </p>
                            <p className="truncate text-xs text-gray-400">{p.brand || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{catName(p)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{formatKyat(p.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${stock <= 0 ? 'text-brand' : stock <= 10 ? 'text-[#b8860b] dark:text-gold' : 'text-gray-700 dark:text-gray-200'}`}>{stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.status === 'active' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-400/15 text-gray-500'}`}>
                          {p.status === 'active' ? t('admin.products.active') : t('admin.products.inactive')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(p)} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-cobalt/10 hover:text-cobalt" aria-label={t('common.edit')}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setConfirmDelete(p)} disabled={p.status === 'inactive'} className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-brand/10 hover:text-brand disabled:opacity-30" aria-label={t('admin.products.delete')}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <ProductForm
          initial={editing === 'new' ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="fh-toast-in w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-950" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand dark:bg-brand-900/30"><Trash2 size={22} /></div>
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">{t('admin.products.delete')}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('admin.products.deleteConfirm', { name: confirmDelete.productName })}</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200">{t('common.cancel')}</button>
              <button onClick={handleDelete} className="flex-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-600">{t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts