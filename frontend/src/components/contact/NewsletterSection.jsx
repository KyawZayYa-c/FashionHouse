import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NewsletterSection = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus(t('newsletter.invalid', 'Please enter a valid email'));
      return;
    }
    try {
      if (onSubmit) await onSubmit(email);
      setStatus(t('newsletter.success', 'Subscribed!'));
      setEmail('');
    } catch {
      setStatus(t('newsletter.error', 'Subscription failed'));
    }
  };

  return (
    <section className="relative py-20 px-6 rounded-lg overflow-hidden bg-gray-900">
      {/* Background image + overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/newsletter-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <h2
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          {t('newsletter.title', 'Newsletter Updates')}
        </h2>
        <p className="text-white/80 text-base md:text-lg mb-8">
          {t('newsletter.subtitle', 'Subscribe to receive new arrivals & special offers')}
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('newsletter.placeholder', 'Email address')}
            className="flex-1 px-4 py-3 text-sm rounded-md outline-none bg-white text-black"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 text-sm font-bold uppercase text-white bg-[#e8363c] hover:bg-[#d81c22] rounded-md transition-colors"
            style={{ fontFamily: 'IBM Plex Mono, monospace' }}
          >
            {t('newsletter.button', 'Subscribe')}
          </button>
        </form>

        {status && <p className="mt-4 text-sm text-white/90">{status}</p>}
      </div>
    </section>
  );
};

export default NewsletterSection;