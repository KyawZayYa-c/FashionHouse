import React from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../data/siteConfig';

const TestimonialSection = () => {
  const { t } = useTranslation();
  const { testimonialImage, testimonialAvatar } = siteConfig.about;

  return (
    <section className="container mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">
        <div className="relative">
          <img
            src={testimonialImage}
            alt={t('about.testimonialTitle')}
            className="w-full h-full object-cover rounded-l-lg"
            loading="lazy"
          />
        </div>

        <div className="bg-[#131117] text-white p-8 md:p-14 rounded-r-lg flex flex-col justify-center">
          <h2
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {t('about.testimonialTitle')}
          </h2>
          <p className="text-white/80 leading-relaxed mb-8">
            {t('about.testimonialText')}
          </p>
          <div className="flex items-center gap-4">
            <img
              src={testimonialAvatar}
              alt={t('about.testimonialAuthor')}
              className="w-14 h-14 rounded-full object-cover border-2 border-[#e8363c]"
              loading="lazy"
            />
            <span
              className="text-lg font-bold text-[#e8363c]"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {t('about.testimonialAuthor')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;