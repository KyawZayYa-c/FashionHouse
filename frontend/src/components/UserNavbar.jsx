
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import {
  ShoppingBag,
  Sun,
  Moon,
  UserRound,
} from 'lucide-react';

const UserNavbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.shop'), path: '/shop' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language?.startsWith('mm') ? 'mm' : 'en';

  const iconProps = {
    size: 20,
    strokeWidth: 1.7,
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <ShoppingBag
            size={30}
            strokeWidth={1.7}
            className="text-black dark:text-white transition-colors"
          />

          <span
            className="text-2xl font-bold tracking-tight text-black dark:text-white transition-colors"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            arderobe
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-semibold tracking-wide transition-all relative pb-1 ${
                  isActive
                    ? 'text-black dark:text-white'
                    : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {link.name}

                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d81c22]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Language, Theme & Actions */}
        <div className="flex items-center gap-4">

          {/* Language Switcher */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              aria-pressed={currentLang === 'en'}
              className={`px-2 py-1 text-xs font-bold transition-colors ${
                currentLang === 'en'
                  ? 'bg-[#e8363c] text-white'
                  : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => changeLanguage('mm')}
              aria-pressed={currentLang === 'mm'}
              className={`px-2 py-1 text-xs font-bold transition-colors ${
                currentLang === 'mm'
                  ? 'bg-[#e8363c] text-white'
                  : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              MM
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="text-gray-600 dark:text-gray-300 hover:text-[#d81c22] transition-colors ml-2"
          >
            {isDark ? (
              <Sun {...iconProps} />
            ) : (
              <Moon {...iconProps} />
            )}
          </button>

          {/* Account Icon */}
          <Link
            to="/login"
            aria-label="Account"
            title="Account"
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          >
            <UserRound {...iconProps} />
          </Link>

          {/* Shopping Bag with Cart Badge */}
          <Link
            to="/cart"
            aria-label="Shopping cart"
            title="Shopping cart"
            className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors relative"
          >
            <ShoppingBag size={22} strokeWidth={1.7} />

            <span className="absolute -top-2 -right-2 bg-[#e8363c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              1
            </span>
          </Link>

        </div>
      </div>
    </header>
  );
};

export default UserNavbar;
