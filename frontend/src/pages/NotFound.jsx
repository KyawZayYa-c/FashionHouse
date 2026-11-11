import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ShoppingBag, Compass } from 'lucide-react'

// A branded 404 that keeps the visitor inside the store instead of a dead end.
const NotFound = () => {
  const { t } = useTranslation()
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-porcelain px-4 py-20 dark:bg-ink">
      <div className="aurora grain pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative z-10 mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand">Fashion House</p>
        <h1 className="mt-4 font-display text-[7rem] font-black leading-none tracking-tighter text-gray-900 dark:text-white md:text-[10rem]">
          4<span className="text-brand">0</span>4
        </h1>
        <h2 className="mt-2 font-display text-2xl font-bold text-gray-900 dark:text-white">
          {t('notFound.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-gray-400">
          {t('notFound.subtitle')}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand dark:bg-white dark:text-ink dark:hover:bg-brand dark:hover:text-white"
          >
            <Home size={16} strokeWidth={2} /> {t('notFound.backHome')}
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-7 py-3 text-sm font-semibold uppercase tracking-wider text-gray-800 transition-colors hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-200"
          >
            <ShoppingBag size={16} strokeWidth={2} /> {t('notFound.backShop')}
          </Link>
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Compass size={14} /> <span className="font-mono uppercase tracking-widest">{t('footer.tagline')}</span>
        </div>
      </div>
    </div>
  )
}

export default NotFound