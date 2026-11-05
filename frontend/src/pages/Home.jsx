import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  
  // --- DARK MODE STATE ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme based on user's system preference or saved choice
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  // Toggle function
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

  // Product data
  const products = [
    {
      id: 1,
      name: t('home.snapbackCap'),
      price: '30,000 Kyats',
      category: t('home.accessories'),
      isSale: true,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      name: t('home.grayShoes'),
      price: '50,000 Kyats',
      category: t('home.sneakers'),
      isSale: false,
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      name: t('home.blackTshirt'),
      price: '25,000 Kyats',
      category: t('home.tshirts'),
      isSale: true,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      name: t('home.retroSunglasses'),
      price: '5500 Kyats',
      category: t('home.accessories'),
      isSale: false, 
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    // Added dark:bg-gray-950 to the main wrapper
    <div className="w-full flex flex-col font-sans bg-white dark:bg-gray-950 transition-colors duration-300 relative">
      
      {/* --- DARK MODE TOGGLE BUTTON --- */}
      {/* Placed floating in the top right for easy access */}
      <button 
        onClick={toggleTheme}
        className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg hover:scale-110 transition-transform duration-300"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? (
          // Sun Icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          // Moon Icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* --- HERO SECTION --- */}
      {/* Updated background for dark mode */}
      <div className="w-full min-h-[calc(100vh-80px)] bg-white dark:bg-gray-900 flex flex-col lg:flex-row overflow-hidden transition-colors duration-300">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 lg:py-0">
          {/* Updated text color */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-black text-gray-900 dark:text-white leading-[1.1] mb-6 transition-colors duration-300">
            Brand New <br />
            Collection
          </h1>
          {/* Updated text color */}
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-lg mb-8 leading-relaxed transition-colors duration-300">
            {t('home.subtitle') || "Mauris vitae ultricies leo integer malesuada tempor orci dapibus ultrices diam in arcu cursus euismod purus viverra accumsan."}
          </p>
          <div className="flex flex-wrap items-center gap-6 mb-10 text-sm font-medium text-gray-800 dark:text-gray-300 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>Top Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>High Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>Quick Delivery</span>
            </div>
          </div>
          <div>
            <button className="bg-[#F2B75A] hover:bg-[#d9a54a] rounded-sm text-gray-900 font-semibold py-3 px-8 tracking-wider uppercase text-sm transition-colors duration-300">
              {t('home.viewAll')}
            </button>
          </div>
        </div>
        <div className="flex-1 relative flex items-center justify-center h-[500px] lg:h-auto">
          <img 
            src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Model wearing a thick white knit sweater" 
            className="w-full h-full object-cover object-top mix-blend-multiply dark:mix-blend-normal dark:opacity-90 transition-all duration-300"
          />
        </div>
      </div>

      {/* --- DARK FEATURES BAR --- */}
      {/* In dark mode, this becomes a slightly lighter gray to distinguish from the deep black background */}
      <div className="w-full bg-[#111111] dark:bg-gray-400 dark:text-black text-white py-16 px-8 md:px-16 lg:px-24 transition-colors duration-300 border-y border-transparent dark:border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15l2 2 4-4" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">{t('home.securePayment')}</h3>
            <p className="text-gray-400 text-sm">{t('home.securePaymentSub')}</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10.5v3m0-3a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">{t('home.return30')}</h3>
            <p className="text-gray-400 text-sm">{t('home.return30Sub')}</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">{t('home.support247')}</h3>
            <p className="text-gray-400 text-sm">{t('home.support247Sub')}</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.5a2.5 2.5 0 00-2.5-2.5h-11" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">{t('home.freeDelivery')}</h3>
            <p className="text-gray-400 text-sm">{t('home.freeDeliverySub')}</p>
          </div>
        </div>
      </div>

      {/* --- NEW ARRIVALS SECTION --- */}
      {/* Updated backgrounds and text colors */}
      <div className="w-full bg-white dark:bg-gray-950 py-20 px-8 md:px-16 lg:px-24 transition-colors duration-300 ">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-5 uppercase tracking-wide transition-colors duration-300">{t('home.checkLatest')}</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white transition-colors duration-300">{t('home.newArrivals')}</h2>
            </div>
            <button className="mt-6 md:mt-0 border border-gray-900 dark:border-gray-300 text-gray-900 dark:text-gray-300 px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-gray-900 hover:text-white dark:hover:bg-gray-300 dark:hover:text-black transition-colors duration-300">
              {t('home.viewAll')}
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col">
                
                {/* Image Container - Dark mode image background changed to dark gray */}
                <div className="relative bg-[#f7f7f7] dark:bg-gray-400 aspect-square flex items-center justify-center p-8 mb-6 overflow-hidden transition-colors duration-300">
                  {product.isSale ? (
                    <span className="absolute top-4 left-4 bg-[#25cf52] rounded-sm text-white text-xs font-bold px-2 py-1 uppercase z-10">
                      {t('home.sale')}
                    </span>
                  ) : (
                    <span className="absolute top-4 left-4 bg-[#d64541] rounded-sm text-white text-xs font-bold px-2 py-1 uppercase z-10">
                      Out of Stock
                    </span>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors duration-300">{product.name}</h3>
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">{product.price}</span>
                </div>

                {/* Category */}
                <p className="text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider mb-4 transition-colors duration-300">{product.category}</p>

                {/* Add to Cart Button */}
                <button className="mt-auto bg-[#F2B75A] rounded-md hover:bg-[#d9a54a] text-gray-900 font-semibold py-3 px-6 text-sm w-max transition-colors duration-300">
                  {t('home.addToCart')}
                </button>
              </div>
            ))}
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default Home;