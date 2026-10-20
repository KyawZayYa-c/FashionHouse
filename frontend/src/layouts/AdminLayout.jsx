
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Shirt,
  Store,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';

const AdminLayout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const [isHovered, setIsHovered] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language?.startsWith('mm') ? 'mm' : 'en';

  const iconProps = {
    size: 20,
    strokeWidth: 1.7,
  };

  const menuGroups = [
    {
      title: t('admin.project') || 'PROJECT',
      items: [
        {
          path: '/admin/dashboard',
          label: t('admin.dashboard'),
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: t('admin.database') || 'DATABASE',
      items: [
        {
          path: '/admin/products',
          label: t('admin.products'),
          icon: Package,
        },
        {
          path: '/admin/orders',
          label: t('admin.orders'),
          icon: ShoppingCart,
        },
      ],
    },
    {
      title: t('admin.services') || 'SERVICES',
      items: [
        {
          path: '/admin/users',
          label: t('admin.users'),
          icon: Users,
        },
        {
          path: '/admin/settings',
          label: t('admin.settings'),
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">

      {/* SIDEBAR */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full z-20 transition-all duration-300 ease-in-out ${
          isHovered ? 'w-64' : 'w-[70px]'
        }`}
      >
        {/* Top Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 overflow-hidden whitespace-nowrap">
          <div className="w-8 h-8 min-w-[32px] bg-[#e8363c] rounded-full flex items-center justify-center text-white">
            <Shirt size={18} strokeWidth={1.8} />
          </div>

          <span
            className={`ml-3 font-bold text-lg text-gray-800 dark:text-white transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {t('admin.panel') || 'Admin Panel'}
          </span>
        </div>

        {/* Menu Area */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="mb-6">
              <div
                className={`px-5 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-wider transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                }`}
              >
                {group.title}
              </div>

              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={!isHovered ? item.label : undefined}
                      className={`flex items-center px-4 py-3 mx-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-[#FFF0EC] text-[#e8363c] dark:bg-red-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="min-w-[32px] flex items-center">
                        <Icon {...iconProps} />
                      </span>

                      <span
                        className={`ml-2 text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Back to Store */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/"
            title={!isHovered ? (t('admin.backToStore') || 'Back to Store') : undefined}
            className="flex items-center text-gray-500 hover:text-[#e8363c] dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <span className="min-w-[32px] ml-1 flex items-center">
              <Store {...iconProps} />
            </span>

            <span
              className={`ml-2 text-sm whitespace-nowrap transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {t('admin.backToStore') || 'Back to Store'}
            </span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col h-screen transition-all duration-300 ease-in-out ${
          isHovered ? 'ml-64' : 'ml-[70px]'
        }`}
      >
        {/* Topbar */}
        <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 shrink-0">

          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2">
            <span className="text-[#e8363c] text-xs font-bold tracking-wider uppercase">
              {t('admin.project') || 'PROJECT'}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Food-App
            </span>
          </div>

          {/* Language, Theme & Actions */}
          <div className="flex items-center gap-5 text-gray-500 dark:text-gray-400">

            {/* Language Switcher */}
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mr-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs font-bold transition-colors ${
                  currentLang === 'en'
                    ? 'bg-[#e8363c] text-white'
                    : 'bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                EN
              </button>

              <button
                onClick={() => changeLanguage('mm')}
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
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="hover:text-[#e8363c] transition-colors"
            >
              {isDark ? (
                <Sun size={20} strokeWidth={1.7} />
              ) : (
                <Moon size={20} strokeWidth={1.7} />
              )}
            </button>

            <button
              aria-label="Notifications"
              title="Notifications"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Bell size={20} strokeWidth={1.7} />
            </button>

            <button
              aria-label="Settings"
              title="Settings"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Settings size={20} strokeWidth={1.7} />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {t('admin.adminUser') || 'Admin'}
                </p>
                <p className="text-[10px] text-gray-500 uppercase">
                  {t('admin.manager') || 'Manager'}
                </p>
              </div>

              <img
                src="https://i.pravatar.cc/150?img=47"
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
