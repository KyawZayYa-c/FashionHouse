import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../data/siteConfig';

const ShopCtaSection = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-[#f7f6f5] dark:bg-gray-950">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2 py-16 md:py-20">
            <h2
              className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-6"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {t('about.ctaTitle')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              {t('about.ctaText')}
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 text-sm font-bold uppercase tracking-wide text-white bg-[#e8363c] hover:bg-[#d81c22] rounded-md transition-colors"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {t('about.shopNow')}
            </Link>
          </div>

          <div className="lg:col-span-3">
            <img
              src={siteConfig.about.ctaImage}
              alt={t('about.ctaTitle')}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopCtaSection;