import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">{t('home.welcome')}</h1>
      <p className="text-gray-600">{t('home.subtitle')}</p>
    </div>
  );
};

export default Home;