import React from 'react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../../data/siteConfig';
import SectionHeading from '../ui/SectionHeading';

const TeamSection = () => {
  const { t } = useTranslation();
  const { teamImages } = siteConfig.about;

  return (
    <section className="container mx-auto px-6 pb-20">
      <SectionHeading
        subtitle={t('about.teamSubtitle')}
        title={t('about.teamTitle')}
        align="center"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
        {teamImages.map((image, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="w-full aspect-[6/7] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
              <img
                src={image}
                alt={t(`about.team.${i}.name`)}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <h3
              className="text-lg font-bold text-black dark:text-white"
              style={{ fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {t(`about.team.${i}.name`)}
            </h3>
            <p className="text-sm text-[#e8363c] font-medium mt-1">
              {t(`about.team.${i}.role`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;