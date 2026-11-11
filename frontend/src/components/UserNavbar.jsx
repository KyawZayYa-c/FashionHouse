import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShoppingBag, Sun, Moon, UserRound, Heart, Search, Menu, X, LayoutDashboard,
  Package, LogOut, ChevronDown,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAppDispatch, useAppSelector } from '../hooks/useAppSelector'
import { selectCartTotalItems } from '../features/cart/cartSlice.jsx'
import { selectWishlistCount } from '../features/wishlist/wishlistSlice.jsx'
import { selectUser, selectIsAuthenticated, logoutThunk } from '../features/auth/authSlice.jsx'
import { useToast } from '../hooks/useToast'

const UserNavbar = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { isDark, toggleTheme } = useTheme()

  const cartCount = useAppSelector(selectCartTotalItems)
  const wishCount = useAppSelector(selectWishlistCount)
  const user = useAppSelector(selectUser)
  const isAuthed = useAppSelector(selectIsAuthenticated)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const accountRef = useRef(null)

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.shop'), path: '/shop' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ]

  // Close transient menus whenever the route changes.
  useEffect(() => {
    setMobileOpen(false)
    setAccountOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Click-outside to dismiss the account dropdown.
  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const currentLang = i18n.language?.startsWith('mm') ? 'mm' : 'en'
  const iconProps = { size: 20, strokeWidth: 1.7 }

  const submitSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop')
    setSearchOpen(false)
    setQuery('')
  }

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    toast.info(t('nav.logout'))
    navigate('/')
  }

  const Badge = ({ count }) =>
    count > 0 ? (
      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
        {count > 99 ? '99+' : count}
      </span>
    ) : null

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-ink/90">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 md:px-6">
        {/* Left: mobile toggle + logo */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMobileOpen((v) => !v)} className="text-gray-700 dark:text-gray-200 md:hidden" aria-label={t('nav.menu')}>
            {mobileOpen ? <X {...iconProps} /> : <Menu {...iconProps} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              <ShoppingBag size={18} strokeWidth={1.9} />
            </span>
            <span className="font-display text-xl font-black tracking-tight text-gray-900 dark:text-white">
              Fashion<span className="text-brand">House</span>
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = link.path === '/' ? location.pathname === '/' : location.pathname.startsWith(link.path)
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative pb-1 text-sm font-semibold tracking-wide transition-colors ${
                  isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 hover:text-brand dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {link.name}
                {isActive && <span className="absolute bottom-0 left-0 h-[2px] w-full bg-brand" />}
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Search */}
          <button type="button" onClick={() => setSearchOpen((v) => !v)} className="rounded-full p-2 text-gray-600 transition-colors hover:text-brand dark:text-gray-300" aria-label={t('nav.search')}>
            <Search {...iconProps} />
          </button>

          {/* Language */}
          <div className="hidden items-center overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 sm:flex">
            {['en', 'mm'].map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => i18n.changeLanguage(lng)}
                aria-pressed={currentLang === lng}
                className={`px-2 py-1 text-xs font-bold uppercase transition-colors ${
                  currentLang === lng ? 'bg-brand text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {lng}
              </button>
            ))}
          </div>

          {/* Theme */}
          <button type="button" onClick={toggleTheme} aria-label={isDark ? t('common.lightMode') : t('common.darkMode')} className="rounded-full p-2 text-gray-600 transition-colors hover:text-brand dark:text-gray-300">
            {isDark ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative rounded-full p-2 text-gray-600 transition-colors hover:text-magenta dark:text-gray-300" aria-label={t('nav.wishlist')}>
            <Heart {...iconProps} />
            <Badge count={wishCount} />
          </Link>

          {/* Account */}
          {isAuthed ? (
            <div className="relative" ref={accountRef}>
              <button type="button" onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-1 rounded-full p-1.5 text-gray-600 transition-colors hover:text-brand dark:text-gray-300" aria-label={t('nav.account')}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand font-display text-sm font-bold text-white">
                  {(user?.username || '?').charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={14} className={`hidden transition-transform sm:block ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountOpen && (
                <div className="fh-toast-in absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lift dark:border-gray-800 dark:bg-ink-900">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <p className="text-[11px] uppercase tracking-wider text-gray-400">{t('nav.signedInAs')}</p>
                    <p className="truncate font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand dark:text-gray-200 dark:hover:bg-ink-800">
                      <UserRound size={16} /> {t('nav.myAccount')}
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand dark:text-gray-200 dark:hover:bg-ink-800">
                      <Package size={16} /> {t('nav.orders')}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand dark:text-gray-200 dark:hover:bg-ink-800">
                        <LayoutDashboard size={16} /> {t('nav.admin')}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 border-t border-gray-100 px-4 py-2.5 text-sm text-brand transition-colors hover:bg-brand/5 dark:border-gray-800">
                      <LogOut size={16} /> {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="rounded-full p-2 text-gray-600 transition-colors hover:text-brand dark:text-gray-300" aria-label={t('nav.login')}>
              <UserRound {...iconProps} />
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="relative rounded-full p-2 text-gray-600 transition-colors hover:text-brand dark:text-gray-300" aria-label={t('nav.cart')}>
            <ShoppingBag size={22} strokeWidth={1.7} />
            <Badge count={cartCount} />
          </Link>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-ink">
          <form onSubmit={submitSearch} className="container mx-auto flex max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-brand dark:border-gray-700 dark:bg-ink-800 dark:text-white"
              />
            </div>
            <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              {t('nav.search')}
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-ink md:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="border-b border-gray-50 py-3 text-sm font-semibold text-gray-700 transition-colors hover:text-brand dark:border-gray-800/60 dark:text-gray-200">
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{t('common.language')}</span>
              {['en', 'mm'].map((lng) => (
                <button key={lng} onClick={() => i18n.changeLanguage(lng)} className={`rounded-md px-3 py-1 text-xs font-bold uppercase ${currentLang === lng ? 'bg-brand text-white' : 'border border-gray-300 text-gray-500 dark:border-gray-700'}`}>
                  {lng}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default UserNavbar