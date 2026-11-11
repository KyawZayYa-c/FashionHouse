import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DollarSign, ShoppingBag, Users, Package, TrendingUp, AlertTriangle, ArrowRight, RefreshCw, Layers,
} from 'lucide-react'
import { adminApi, formatKyat, parsePrice } from '../services/baseApi.jsx'
import OrderStatusBadge from '../components/OrderStatusBadge'

const STATUS_COLORS = {
  pending: '#f2b75a',
  confirmed: '#2f5bff',
  processing: '#2f5bff',
  shipped: '#d6249f',
  delivered: '#10b981',
  cancelled: '#9ca3af',
  returned: '#e8363c',
}

const StatCard = ({ icon: Icon, label, value, tint, sub }) => (
  <div className="fh-fade-up relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10" style={{ backgroundColor: tint }} />
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: `${tint}1f`, color: tint }}>
        <Icon size={18} strokeWidth={2} />
      </span>
    </div>
    <p className="mt-4 font-display text-3xl font-black tracking-tight text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
  </div>
)

const AdminDashboard = () => {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [best, setBest] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dash, rec, low, bs] = await Promise.all([
        adminApi.dashboard(),
        adminApi.recentOrders(),
        adminApi.lowStock(),
        adminApi.bestSelling(),
      ])
      setStats(dash)
      setRecent(rec.orders || [])
      setLowStock(low.products || [])
      setBest(bs.products || [])
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

  if (loading) {
    return (
      <div>
        <div className="fh-skeleton h-9 w-56 rounded" />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="fh-skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="fh-skeleton mt-6 h-72 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
        <AlertTriangle size={32} className="text-brand" />
        <p className="mt-4 font-semibold text-gray-900 dark:text-white">{t('admin.loadError')}</p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button onClick={load} className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
          <RefreshCw size={15} /> {t('admin.retry')}
        </button>
      </div>
    )
  }

  const os = stats?.orderStats || {}
  const ps = stats?.productStats || {}
  const cs = stats?.categoryStats || {}
  const statusRows = [
    ['pending', os.pendingOrders], ['confirmed', os.confirmedOrders], ['shipped', os.shippedOrders],
    ['delivered', os.deliveredOrders], ['cancelled', os.cancelledOrders],
  ].map(([k, v]) => ({ key: k, value: Number(v) || 0 }))
  const maxStatus = Math.max(1, ...statusRows.map((r) => r.value))

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">{t('admin.dashboard')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('admin.overviewSubtitle')}</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-300">
          <RefreshCw size={14} /> {t('admin.retry')}
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={DollarSign} label={t('admin.totalSales')} value={formatKyat(os.totalSales)} tint="#10b981" sub={t('admin.totalOrders') + ': ' + (os.totalOrders || 0)} />
        <StatCard icon={ShoppingBag} label={t('admin.totalOrders')} value={(os.totalOrders || 0).toLocaleString()} tint="#2f5bff" sub={`${os.pendingOrders || 0} ${t('admin.pendingOrders')}`} />
        <StatCard icon={Users} label={t('admin.totalUsers')} value={(stats?.totalCustomers || 0).toLocaleString()} tint="#d6249f" />
        <StatCard icon={Package} label={t('admin.totalProducts')} value={(ps.totalProducts || 0).toLocaleString()} tint="#f2b75a" sub={`${ps.activeProducts || 0} ${t('admin.activeProducts')} · ${cs.totalCategories || 0} ${t('admin.totalCategories')}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{t('admin.recentOrders')}</h2>
            <Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand hover:underline">
              {t('admin.viewAll')} <ArrowRight size={13} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">{t('admin.noOrders')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800">
                    <th className="pb-3 font-semibold">{t('admin.orders.order')}</th>
                    <th className="pb-3 font-semibold">{t('admin.customer')}</th>
                    <th className="pb-3 font-semibold">{t('admin.orderStatus')}</th>
                    <th className="pb-3 text-right font-semibold">{t('admin.amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {recent.slice(0, 6).map((o) => (
                    <tr key={o._id}>
                      <td className="py-3 font-mono text-xs font-semibold text-gray-900 dark:text-white">{o.orderNumber}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-300">{o.userId?.username || '—'}</td>
                      <td className="py-3"><OrderStatusBadge status={o.orderStatus} withIcon={false} /></td>
                      <td className="py-3 text-right font-semibold text-gray-900 dark:text-white">{formatKyat(o.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Status distribution */}
          <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400"><Layers size={14} /> {t('admin.orderStatus')}</h3>
            <div className="space-y-2.5">
              {statusRows.map((r) => (
                <div key={r.key} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">{t(`status.${r.key}`)}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(r.value / maxStatus) * 100}%`, backgroundColor: STATUS_COLORS[r.key] }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums text-gray-700 dark:text-gray-200">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: best sellers + low stock */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900 dark:text-white">
              <TrendingUp size={18} className="text-emerald-500" /> {t('admin.bestSelling')}
            </h2>
            {best.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">{t('admin.noBestSelling')}</p>
            ) : (
              <ul className="space-y-3">
                {best.slice(0, 5).map((p, i) => (
                  <li key={p.productId || i} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 font-mono text-xs font-bold text-brand dark:bg-brand-900/30">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{p.productName}</p>
                      <p className="truncate text-xs text-gray-400">{p.brand || '—'}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400">{t('admin.unitsSold', { count: p.totalSold })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gray-900 dark:text-white">
              <AlertTriangle size={18} className="text-gold" /> {t('admin.lowStock')}
            </h2>
            {lowStock.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">{t('admin.noLowStock')}</p>
            ) : (
              <ul className="space-y-3">
                {lowStock.slice(0, 5).map((p) => {
                  const min = Math.min(...(p.variants || []).map((v) => Number(v.stock) || 0), 999)
                  return (
                    <li key={p._id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{p.productName}</p>
                        <p className="truncate text-xs text-gray-400">{p.brand || '—'}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${min <= 3 ? 'bg-brand/15 text-brand' : 'bg-gold/15 text-[#b8860b] dark:text-gold'}`}>
                        {t('admin.stockLeft', { count: min === 999 ? 0 : min })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            <Link to="/admin/products" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand hover:underline">
              {t('admin.products.title')} <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard