import React from 'react';
import { useTranslation } from 'react-i18next';

import AboutHero from '../components/about/AboutHero';
import CollectionSection from '../components/about/CollectionSection';
import TeamSection from '../components/about/TeamSection';
import TestimonialSection from '../components/about/TestimonialSection';
import ShopCtaSection from '../components/about/ShopCtaSection';
import NewsletterSection from '../components/contact/NewsletterSection'; // 👈 ပြန်သုံး

const About = () => {
  const { t } = useTranslation();

  const handleNewsletterSubmit = async (email) => {
    // TODO: axios.post('/api/newsletter', { email })
    console.log('Newsletter:', email);
  };

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <AboutHero />
      <CollectionSection />
      <TeamSection />
      <TestimonialSection />
      <ShopCtaSection />

      {/* Newsletter — Contact page က component ပြန်သုံး */}
      <div className="container mx-auto px-6 py-20">
        <NewsletterSection onSubmit={handleNewsletterSubmit} />
      </div>
    </div>
  );
};

export default About;