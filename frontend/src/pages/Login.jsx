import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, User, Phone, Loader2, ArrowRight, Eye, EyeOff, ShieldCheck, UserRound } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import {
  loginThunk, registerThunk, selectAuthError, selectAuthLoading, clearAuthError,
} from '../features/auth/authSlice.jsx'
import { syncGuestCartThunk } from '../features/cart/cartSlice.jsx'
import { syncGuestWishlistThunk } from '../features/wishlist/wishlistSlice.jsx'
import { useToast } from '../hooks/useToast'
import ProductImage from '../components/ProductImage'

const AUTH_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'

const DEMO = {
  admin: { email: 'admin@fashionhouse.com', password: 'Admin@12345' },
  customer: { email: 'demo@fashionhouse.com', password: 'Demo@12345' },
}

const Login = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const error = useAppSelector(selectAuthError)
  const loading = useAppSelector(selectAuthLoading)

  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' })

  const from = location.state?.from?.pathname || null

  useEffect(() => {
    dispatch(clearAuthError())
  }, [isLogin, dispatch])

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const finishAuth = (user) => {
    // Merge any guest selections into the now-authenticated account.
    dispatch(syncGuestCartThunk())
    dispatch(syncGuestWishlistThunk())
    toast.success(t('loginPage.welcomeBack'))
    if (user?.role === 'admin') navigate('/admin/dashboard', { replace: true })
    else navigate(from || '/shop', { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isLogin) {
        const res = await dispatch(loginThunk({ email: form.email.trim(), password: form.password })).unwrap()
        finishAuth(res.user)
      } else {
        const res = await dispatch(registerThunk({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
        })).unwrap()
        finishAuth(res.user)
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : t('contact.error'))
    }
  }

  const fillDemo = (kind) => {
    setIsLogin(true)
    setForm((f) => ({ ...f, email: DEMO[kind].email, password: DEMO[kind].password }))
    dispatch(clearAuthError())
  }

  const inputWrap = 'relative'
  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-brand dark:border-gray-700 dark:bg-ink-800 dark:text-white'
  const iconClass = 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="grid overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-card dark:border-gray-800 dark:bg-ink-900 lg:grid-cols-2">
        {/* Image panel */}
        <div className="relative hidden lg:block">
          <ProductImage src={AUTH_IMAGE} alt="Fashion House" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold">{t('loginPage.brandName')}</p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight">{t('loginPage.tagline')}</h2>
            <p className="mt-3 max-w-xs text-sm text-white/70">{t('home.heroSubtitle')}</p>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              {isLogin ? t('loginPage.welcomeBack') : t('loginPage.createAccount')}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? t('loginPage.loginSubtitle') : t('loginPage.registerSubtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border-l-4 border-brand bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('loginPage.username')}</label>
                <div className={inputWrap}>
                  <User size={17} className={iconClass} />
                  <input
                    type="text"
                    required
                    minLength={3}
                    value={form.username}
                    onChange={(e) => setField('username', e.target.value)}
                    placeholder={t('loginPage.usernamePlaceholder')}
                    className={inputClass}
                    autoComplete="username"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('loginPage.email')}</label>
              <div className={inputWrap}>
                <Mail size={17} className={iconClass} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder={t('loginPage.emailPlaceholder')}
                  className={inputClass}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('loginPage.password')}</label>
              <div className={inputWrap}>
                <Lock size={17} className={iconClass} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder={t('loginPage.passwordPlaceholder')}
                  className={`${inputClass} pr-11`}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-brand"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('loginPage.phone')}</label>
                <div className={inputWrap}>
                  <Phone size={17} className={iconClass} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder={t('loginPage.phonePlaceholder')}
                    className={inputClass}
                    autoComplete="tel"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-600 disabled:bg-gray-400"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading
                ? (isLogin ? t('loginPage.signingIn') : t('loginPage.creating'))
                : (isLogin ? t('loginPage.loginBtn') : t('loginPage.registerBtn'))}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gray-400">{t('loginPage.orContinue')}</span>
              <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-200"
              >
                <ShieldCheck size={15} /> {t('loginPage.adminDemo')}
              </button>
              <button
                type="button"
                onClick={() => fillDemo('customer')}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-200"
              >
                <UserRound size={15} /> {t('loginPage.customerDemo')}
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? t('loginPage.noAccount') : t('loginPage.hasAccount')}{' '}
            <button
              type="button"
              onClick={() => setIsLogin((v) => !v)}
              className="font-bold text-brand hover:underline"
            >
              {isLogin ? t('loginPage.signUpLink') : t('loginPage.signInLink')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login