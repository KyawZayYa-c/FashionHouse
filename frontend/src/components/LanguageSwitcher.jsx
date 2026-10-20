import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const current = i18n.language?.startsWith('mm') ? 'mm' : 'en';

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded font-medium border ${
          current === 'en'
            ? 'bg-red-600 text-white border-red-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('mm')}
        className={`px-3 py-1 rounded font-medium border ${
          current === 'mm'
            ? 'bg-red-600 text-white border-red-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`}
      >
        မြန်မာ
      </button>
    </div>
  );
};

export default LanguageSwitcher;