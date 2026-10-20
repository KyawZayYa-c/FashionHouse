import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-6">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* About Us */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-6 tracking-wide" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {t('footer.aboutTitle')}
            </h3>
            <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed space-y-4">
              {/* ဒီနေရာမှာ စာသားရှည်တွေကို t() သုံးပြီး ပြောင်းထားပါတယ် */}
              <p>{t('footer.aboutDesc1')}<br/>{t('footer.aboutDesc2')}</p>
              <p>{t('footer.aboutDesc3')}</p>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-6 tracking-wide" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {t('footer.accountTitle')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/account" className="hover:text-[#d81c22] transition-colors">{t('footer.myAccount')}</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#d81c22] transition-colors">{t('footer.myWishlist')}</Link></li>
              <li><Link to="/cart" className="hover:text-[#d81c22] transition-colors">{t('footer.myCart')}</Link></li>
              <li><Link to="/login" className="hover:text-[#d81c22] transition-colors">{t('footer.signIn')}</Link></li>
              <li><Link to="/checkout" className="hover:text-[#d81c22] transition-colors">{t('footer.checkOut')}</Link></li>
            </ul>
          </div>

          {/* Shipping */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-6 tracking-wide" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {t('footer.shippingTitle')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/new" className="hover:text-[#d81c22] transition-colors">{t('footer.newProducts')}</Link></li>
              <li><Link to="/best-sellers" className="hover:text-[#d81c22] transition-colors">{t('footer.bestSellers')}</Link></li>
              <li><Link to="/manufacturers" className="hover:text-[#d81c22] transition-colors">{t('footer.manufacturers')}</Link></li>
              <li><Link to="/suppliers" className="hover:text-[#d81c22] transition-colors">{t('footer.suppliers')}</Link></li>
              <li><Link to="/specials" className="hover:text-[#d81c22] transition-colors">{t('footer.specials')}</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white mb-6 tracking-wide" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {t('footer.contactTitle')}
            </h3>
            <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
              <p>{t('footer.phone')}: (+63) 555 1212</p>
              <p>{t('footer.fax')}: (+63) 555 0100</p>
              <p className="pt-2">{t('footer.address1')},<br/>{t('footer.address2')}</p>
            </div>
          </div>
        </div>

        {/* Footer Bottom (Logo & Copyright) */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-10 flex flex-col items-center justify-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white">
              <path d="M6 6V4C6 2.89543 6.89543 2 8 2H16C17.1046 2 18 2.89543 18 4V6H21C21.5523 6 22 6.44772 22 7V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V7C2 6.44772 2.44772 6 3 6H6ZM8 6H16V4H8V6ZM4 8V20H20V8H4Z" fill="currentColor"/>
              <path d="M12 11C10.3431 11 9 12.3431 9 14C9 15.6569 10.3431 17 12 17C13.6569 17 15 15.6569 15 14C15 12.3431 13.6569 11 12 11Z" fill="currentColor"/>
            </svg>
            <span className="text-3xl font-bold tracking-tight text-black dark:text-white transition-colors" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              arderobe
            </span>
          </div>

          <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
            {t('footer.copyright')}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default UserFooter;