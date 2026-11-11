import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  UserRound, Package, MapPin, Lock, LogOut, Loader2, Check,
  ShieldCheck, ChevronRight, Mail, Phone, ShoppingBag,
} from 'lucide-react'
import { authApi, orderApi, formatKyat } from '../services/baseApi.jsx'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { selectUser, getMeThunk, logoutThunk } from '../features/auth/authSlice.jsx'
import { useToast } from '../hooks/useToast'
import OrderStatusBadge from '../components/OrderStatusBadge'
import EmptyState from '../components/EmptyState'

const TABS = [
  { id: 'profile', icon: UserRound },
  { id: 'orders', icon: Package },
  { id: 'addresses', icon: MapPin },
  { id: 'security', icon: Lock },
]

const Account = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const user = useAppSelector(selectUser)

  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ username: user?.username || '', phone: user?.phone || '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    setProfile({ username: user?.username || '', phone: user?.phone || '' })
  }, [user])

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const data = await orderApi.myOrders({ limit: 5 })
        if (alive) setOrders(data.orders || [])
      } catch {
        /* preview is optional */
      } finally {
        if (alive) setOrdersLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authApi.updateProfile({ username: profile.username.trim(), phone: profile.phone.trim() })
      await dispatch(getMeThunk()).unwrap()
      toast.success(t('account.profileUpdated'))
    } catch (err) {
      toast.error(err.message || t('contact.error'))
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (pw.newPassword !== pw.confirm) {
      toast.error(t('account.passwordMismatch'))
      return
    }
    setSavingPw(true)
    try {
      await authApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword })
      setPw({ currentPassword: '', newPassword: '', confirm: '' })
      toast.success(t('account.passwordChanged'))
    } catch (err) {
      toast.error(err.message || t('contact.error'))
    } finally {
      setSavingPw(false)
    }
  }

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    toast.info(t('account.logout'))
    navigate('/', { replace: true })
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-brand disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:bg-ink-800 dark:text-white dark:disabled:bg-ink-700'
  const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200'

  return (
    <div className="min-h-screen bg-porcelain dark:bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-800/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient font-display text-2xl font-black text-white">
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                {t('account.welcome', { name: user?.username })}
              </h1>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Mail size={13} /> {user?.email}
                {user?.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">
                    <ShieldCheck size={11} /> {t('admin.adminUser')}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-200"
              >
                {t('account.adminPanel')}
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand"
            >
              <LogOut size={15} /> {t('account.logout')}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Tabs */}
          <aside>
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {TABS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    tab === id
                      ? 'bg-brand text-white'
                      : 'text-gray-600 hover:bg-white dark:text-gray-300 dark:hover:bg-ink-800'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.8} /> {t(`account.${id}`)}
                </button>
              ))}
            </nav>
          </aside>

          {/* Panels */}
          <main>
            {tab === 'profile' && (
              <section className="fh-fade-up rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-800/50">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{t('account.profile')}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('account.profileSubtitle')}</p>
                <form onSubmit={saveProfile} className="mt-6 grid max-w-lg gap-4">
                  <div>
                    <label className={labelClass}>{t('account.username')}</label>
                    <input className={inputClass} value={profile.username} minLength={3} required onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelClass}>{t('account.email')}</label>
                    <input className={inputClass} value={user?.email || ''} disabled />
                  </div>
                  <div>
                    <label className={labelClass}>{t('account.phone')}</label>
                    <input className={inputClass} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} inputMode="tel" />
                  </div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="mt-2 inline-flex w-max items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 disabled:bg-gray-400"
                  >
                    {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                    {savingProfile ? t('account.saving') : t('account.saveProfile')}
                  </button>
                </form>
              </section>
            )}

            {tab === 'orders' && (
              <section className="fh-fade-up rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-800/50">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{t('account.myOrders')}</h2>
                  <Link to="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                    {t('account.viewAllOrders')} <ChevronRight size={14} />
                  </Link>
                </div>
                {ordersLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="fh-skeleton h-16 rounded-xl" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyState icon={ShoppingBag} title={t('account.noOrders')} actionLabel={t('account.startShopping')} actionTo="/shop" />
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <Link
                        key={o._id}
                        to={`/orders/${o._id}`}
                        className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition-colors hover:border-brand dark:border-gray-700"
                      >
                        <div>
                          <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">{o.orderNumber}</p>
                          <p className="mt-0.5 text-xs text-gray-400">{t('orders.itemCount', { count: o.itemCount })} · {formatKyat(o.totalAmount)}</p>
                        </div>
                        <OrderStatusBadge status={o.orderStatus} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {tab === 'addresses' && (
              <section className="fh-fade-up rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-800/50">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{t('account.savedAddresses')}</h2>
                <div className="mt-6">
                  {(user?.addresses || []).length === 0 ? (
                    <EmptyState icon={MapPin} title={t('account.noAddresses')} actionLabel={t('account.startShopping')} actionTo="/shop" />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {user.addresses.map((a, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900 dark:text-white">{a.recipientName}</p>
                            {a.isDefault && <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">{t('account.default')}</span>}
                          </div>
                          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"><Phone size={13} /> {a.phone}</p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{[a.address, a.township, a.city].filter(Boolean).join(', ')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {tab === 'security' && (
              <section className="fh-fade-up rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-ink-800/50">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{t('account.changePassword')}</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('account.securitySubtitle')}</p>
                <form onSubmit={savePassword} className="mt-6 grid max-w-lg gap-4">
                  <div>
                    <label className={labelClass}>{t('account.currentPassword')}</label>
                    <input type="password" required className={inputClass} value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} autoComplete="current-password" />
                  </div>
                  <div>
                    <label className={labelClass}>{t('account.newPassword')}</label>
                    <input type="password" required minLength={6} className={inputClass} value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} autoComplete="new-password" />
                  </div>
                  <div>
                    <label className={labelClass}>{t('account.confirmPassword')}</label>
                    <input type="password" required minLength={6} className={inputClass} value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
                  </div>
                  <button
                    type="submit"
                    disabled={savingPw}
                    className="mt-2 inline-flex w-max items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 disabled:bg-gray-400"
                  >
                    {savingPw ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    {savingPw ? t('account.saving') : t('account.changePassword')}
                  </button>
                </form>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Account