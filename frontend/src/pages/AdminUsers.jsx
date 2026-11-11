import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Search, AlertCircle, ShieldCheck, Mail } from 'lucide-react'
import { adminApi } from '../services/baseApi.jsx'
import EmptyState from '../components/EmptyState'

const AVATAR_TINTS = ['#e8363c', '#2f5bff', '#d6249f', '#f2b75a', '#10b981', '#7c3aed']

const AdminUsers = () => {
  const { t, i18n } = useTranslation()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.customers()
      setCustomers(data.customers || [])
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((c) => {
      if (roleFilter !== 'all' && c.role !== roleFilter) return false
      if (!q) return true
      return c.username?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    })
  }, [customers, search, roleFilter])

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(i18n.language?.startsWith('mm') ? 'en-GB' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">{t('admin.users.title')}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('admin.users.subtitle')}</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.users.search')} className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-gray-950 dark:text-white" />
        </div>
        <div className="flex gap-2">
          {['all', 'customer', 'admin'].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${roleFilter === r ? 'bg-brand text-white' : 'border border-gray-300 text-gray-600 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-300'}`}>
              {r === 'all' ? t('common.all') : r === 'admin' ? t('admin.users.admin') : t('admin.users.customer')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fh-skeleton h-24 rounded-2xl" />)}</div>
      ) : error ? (
        <EmptyState icon={AlertCircle} title={t('admin.loadError')} description={error} actionLabel={t('admin.retry')} onAction={load} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title={t('admin.users.empty')} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => {
            const tint = AVATAR_TINTS[i % AVATAR_TINTS.length]
            return (
              <div key={c._id} className="fh-fade-up flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950" style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold text-white" style={{ backgroundColor: tint }}>
                  {(c.username || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{c.username}</p>
                    {c.role === 'admin' && <ShieldCheck size={14} className="shrink-0 text-brand" />}
                  </div>
                  <p className="flex items-center gap-1 truncate text-xs text-gray-400"><Mail size={11} /> {c.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-400/15 text-gray-500'}`}>
                      {c.isActive ? t('admin.users.active') : t('admin.users.inactive')}
                    </span>
                    <span className="text-[11px] text-gray-400">{t('admin.users.joined')} {fmtDate(c.createdAt)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminUsers