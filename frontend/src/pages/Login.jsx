import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Login = () => {
  const { t } = useTranslation();
  
  // State for toggling between Login and Register
  const [isLogin, setIsLogin] = useState(true);

  // --- DARK MODE STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Form Submit Handler (Mock)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in..." : "Registering...");
    // Add your API call here
  };

  return (
    <div className="min-h-screen w-full flex font-sans bg-white dark:bg-gray-950 transition-colors duration-300">
      
      {/* --- DARK MODE TOGGLE BUTTON --- */}
      <button 
        onClick={toggleTheme}
        className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:scale-110 transition-transform duration-300"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* --- LEFT SIDE: IMAGE (Hidden on mobile) --- */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-100 dark:bg-[#1a1a1a]">
        <img 
          src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
          alt="Fashion Model" 
          className="w-full h-full object-cover object-center mix-blend-multiply dark:mix-blend-normal dark:opacity-90"
        />
        {/* Overlay text on image */}
        <div className="absolute bottom-12 left-12 text-white drop-shadow-md">
          <h2 className="text-4xl font-serif font-bold mb-2">Fashion House</h2>
          <p className="text-lg opacity-90">Elevate your style.</p>
        </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-black text-gray-900 dark:text-white mb-2 transition-colors duration-300">
              {isLogin ? t('loginPage.welcomeBack') : t('loginPage.createAccount')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
              {isLogin ? t('loginPage.loginSubtitle') : t('loginPage.registerSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name (Register Only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('loginPage.fullName')}
                </label>
                <input 
                  type="text" 
                  required
                  placeholder={t('loginPage.fullNamePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-[#222] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-300 transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('loginPage.email')}
              </label>
              <input 
                type="email" 
                required
                placeholder={t('loginPage.emailPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-[#222] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-300 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('loginPage.password')}
              </label>
              <input 
                type="password" 
                required
                placeholder={t('loginPage.passwordPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-sm bg-white dark:bg-[#222] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-300 transition-colors"
              />
            </div>

            {/* Forgot Password (Login Only) */}
            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-sm text-[#d64541] hover:underline">
                  {t('loginPage.forgotPassword')}
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-[#F2B75A] hover:bg-[#d9a54a] text-gray-900 font-semibold py-3 px-8 tracking-wider uppercase text-sm transition-colors duration-300 mt-4"
            >
              {isLogin ? t('loginPage.loginBtn') : t('loginPage.registerBtn')}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">{t('loginPage.orContinue')}</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          {/* Social Buttons */}
          <div className="mt-6 flex gap-4">
            <button className="w-full flex justify-center items-center gap-2 py-3 border border-gray-300 dark:border-gray-700 rounded-sm hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fillRule="evenodd" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fillRule="evenodd" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fillRule="evenodd" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fillRule="evenodd" /></svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
            </button>

          </div>

          {/* Toggle Login/Register */}
          <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? t('loginPage.noAccount') : t('loginPage.hasAccount')}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-bold text-gray-900 dark:text-white hover:text-[#d64541] dark:hover:text-[#d64541] transition-colors"
            >
              {isLogin ? t('loginPage.signUpLink') : t('loginPage.signInLink')}
            </button>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;