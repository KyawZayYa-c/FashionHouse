import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings, Store, Mail, Phone, MapPin, Clock, Plus, Trash2, Tag, AlertCircle, Loader2, Check,
} from 'lucide-react'
import { categoryApi, catalogApi } from '../services/baseApi.jsx'
import { siteConfig } from '../data/siteConfig'
import EmptyState from '../components/EmptyState'
import { useToast } from '../hooks/useToast'

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3 py-3">
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand dark:bg-brand-900/30"><Icon size={15} /></span>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <div className="mt-0.5 text-sm text-gray-700 dark:text-gray-200">{children}</div>
    </div>
  </div>
)

const AdminSettings = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [cData, pData] = await Promise.all([categoryApi.list(), catalogApi.getProducts({ limit: 200 })])
      setCategories(cData.categories || [])
      setProducts(pData.products || [])
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

  const counts = useMemo(() => {
    const map = {}
    products.forEach((p) => {
      const id = String(p.categoryId?._id || p.categoryId || '')
      map[id] = (map[id] || 0) + 1
    })
    return map
  }, [products])

  const onName = (v) => { setName(v); if (!slugTouched) setSlug(slugify(v)) }

  const createCategory = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      // Backend requires a slug (it calls slug.toLowerCase()); always send one.
      const data = await categoryApi.create({ categoryName: name.trim(), slug: slugify(slug || name), description: '' })
      setCategories((prev) => [...prev, data.category].sort((a, b) => a.categoryName.localeCompare(b.categoryName)))
      setName(''); setSlug(''); setSlugTouched(false)
      toast.success(t('admin.settings.categoryCreated'))
    } catch (err) {
      toast.error(err.message || t('admin.loadError'))
    } finally {
      setCreating(false)
    }
  }

  const deleteCategory = async () => {
    const target = confirmDelete
    setConfirmDelete(null)
    const snapshot = categories
    setCategories((prev) => prev.filter((c) => c._id !== target._id))
    try {
      await categoryApi.remove(target._id)
      toast.success(t('admin.settings.categoryDeleted'))
    } catch (err) {
      setCategories(snapshot)
      toast.error(err.message || t('admin.loadError'))
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-900 dark:text-white'

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">{t('admin.settings.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('admin.settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Store info (read-only reference) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-gray-900 dark:text-white">
            <Store size={18} className="text-brand" /> {t('admin.settings.storeInfo')}
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <InfoRow icon={Store} label={t('admin.settings.storeName')}>{siteConfig.shopName}</InfoRow>
            <InfoRow icon={Mail} label={t('admin.settings.email')}>{siteConfig.contact.email}</InfoRow>
            <InfoRow icon={Phone} label={t('admin.settings.phone')}>{siteConfig.contact.phone.join(' · ')}</InfoRow>
            <InfoRow icon={MapPin} label={t('admin.settings.address')}>{siteConfig.contact.address.join(', ')}</InfoRow>
            <InfoRow icon={Clock} label={t('contact.info.hours')}>{siteConfig.contact.hours.join(' · ')}</InfoRow>
          </div>
        </div>

        {/* Category management (live CRUD) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900 dark:text-white">
            <Tag size={18} className="text-brand" /> {t('admin.settings.categories')}
          </h2>

          <form onSubmit={createCategory} className="mb-5 space-y-3 rounded-xl border border-gray-200 bg-porcelain-200/40 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('admin.settings.categoryName')}</label>
                <input className={inputCls} value={name} onChange={(e) => onName(e.target.value)} placeholder={t('admin.settings.categoryName')} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('admin.settings.categorySlug')}</label>
                <input className={`${inputCls} font-mono text-xs`} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }} placeholder="slug" />
              </div>
            </div>
            <button type="submit" disabled={creating || !name.trim()} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} {t('admin.settings.addCategory')}
            </button>
          </form>

          {loading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="fh-skeleton h-12 rounded-lg" />)}</div>
          ) : error ? (
            <EmptyState icon={AlertCircle} title={t('admin.loadError')} description={error} actionLabel={t('admin.retry')} onAction={load} />
          ) : categories.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">{t('admin.settings.noCategories')}</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c._id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2.5 dark:border-gray-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{c.categoryName}</p>
                    <p className="truncate font-mono text-xs text-gray-400">{c.slug} · {t('admin.settings.productCount', { count: counts[String(c._id)] || 0 })}</p>
                  </div>
                  <button onClick={() => setConfirmDelete(c)} className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-brand/10 hover:text-brand" aria-label={t('common.delete')}>
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="fh-toast-in w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-gray-950" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand dark:bg-brand-900/30"><Trash2 size={22} /></div>
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">{t('common.delete')}</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('admin.settings.categoryDeleteConfirm', { name: confirmDelete.categoryName })}</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200">{t('common.cancel')}</button>
              <button onClick={deleteCategory} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-600"><Check size={15} /> {t('common.confirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings