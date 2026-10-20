import React from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../data/siteConfig';

const CollectionSection = () => {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-6 -mt-16 mb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#131117] text-white rounded-lg overflow-hidden p-6 md:p-10">
        <div className="relative">
          <img
            src={siteConfig.about.collectionImage}
            alt={t('about.collectionTitle')}
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        </div>

        <div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {t('about.collectionTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/80 leading-relaxed">
            <p>{t('about.collectionText.0')}</p>
            <p>{t('about.collectionText.1')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;