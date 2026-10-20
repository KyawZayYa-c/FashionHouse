import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AboutHero = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 md:py-24 border-b border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-6 text-center">
        <nav className="flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/" className="hover:text-[#e8363c] transition-colors">
            {t('nav.home', 'Home')}
          </Link>
          <span>/</span>
          <span className="text-black dark:text-white font-medium">
            {t('nav.about', 'About')}
          </span>
        </nav>

        <h1
          className="text-4xl md:text-6xl font-bold text-black dark:text-white tracking-tight"
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          {t('about.heroTitle', 'About Us')}
        </h1>
      </div>
    </section>
  );
};

export default AboutHero;