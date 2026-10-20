import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ContactHero from '../components/contact/ContactHero';
import ContactInfoCard from '../components/contact/ContactInfoCard';
import ContactForm from '../components/contact/ContactForm';
import NewsletterSection from '../components/contact/NewsletterSection';
import SectionHeading from '../components/ui/SectionHeading';
import { siteConfig } from '../data/siteConfig';   // 👈 ဒီမှာ import

const Contact = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleContactSubmit = async (formData) => {
    setLoading(true);
    try {
      // TODO: axios.post('/api/contact', formData)
      await new Promise((res) => setTimeout(res, 800));
      console.log('Contact form data:', formData);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = async (email) => {
    // TODO: axios.post('/api/newsletter', { email })
    console.log('Newsletter:', email);
  };

  // 👇 siteConfig ကနေ ယူထားတယ် (hardcode မဟုတ်)
  const { phone, email, address, hours } = siteConfig.contact;

  const infoCards = [
    {
      icon: Phone,
      title: t('contact.info.phone', 'Phone'),
      lines: phone,
      href: `tel:${phone[0].replace(/[^\d+]/g, '')}`,
    },
    {
      icon: Mail,
      title: t('contact.info.email', 'Email'),
      lines: [email],
      href: `mailto:${email}`,
    },
    {
      icon: MapPin,
      title: t('contact.info.address', 'Address'),
      lines: address,
    },
    {
      icon: Clock,
      title: t('contact.info.hours', 'Open Hours'),
      lines: hours,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
      <ContactHero />

      {/* Info Cards */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {infoCards.map((card, i) => (
            <ContactInfoCard key={i} {...card} />
          ))}
        </div>
      </section>

      {/* Form + Side Image */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-6">
            <SectionHeading
              subtitle={t('contact.formSubtitle', 'Get in touch')}
              title={t('contact.formTitle', 'Send us a message')}
            />
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {t(
                'contact.intro',
                'Have a question about an order, product, or delivery? Fill in the form and our team will get back to you within 24 hours.'
              )}
            </p>
            <div className="relative rounded-lg overflow-hidden bg-[#e8363c] aspect-[4/5] max-w-sm">
              <img
                src="/images/contact-us.jpg"
                alt={t('contact.imageAlt', 'Contact Fashion House')}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 md:p-10 rounded-lg border border-gray-100 dark:border-gray-700">
            <ContactForm onSubmit={handleContactSubmit} loading={loading} />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <NewsletterSection onSubmit={handleNewsletterSubmit} />
      </section>
    </div>
  );
};

export default Contact;