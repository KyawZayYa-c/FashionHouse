import React, { useState } from 'react';
import FormInput from '../ui/FormInput';
import FormTextarea from '../ui/FormTextarea';
import { useTranslation } from 'react-i18next';

const initialValues = {
  name: '',
  phone: '',
  email: '',
  message: '',
};

const ContactForm = ({ onSubmit, loading = false, externalError = '' }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Simple client-side validation (reusable)
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('contact.errors.nameRequired', 'Name is required');
    if (!form.phone.trim()) next.phone = t('contact.errors.phoneRequired', 'Phone is required');
    else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
      next.phone = t('contact.errors.phoneInvalid', 'Invalid phone number');
    if (!form.email.trim()) next.email = t('contact.errors.emailRequired', 'Email is required');
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = t('contact.errors.emailInvalid', 'Invalid email');
    if (!form.message.trim()) next.message = t('contact.errors.messageRequired', 'Message is required');
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      if (onSubmit) await onSubmit(form);
      setStatus({ type: 'success', msg: t('contact.success', 'Message sent successfully!') });
      setForm(initialValues);
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err?.message || t('contact.error', 'Something went wrong. Please try again.'),
      });
    }
  };

  const finalError = externalError || (status.type === 'error' ? status.msg : '');

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          label={t('contact.form.name', 'Name')}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t('contact.form.namePlaceholder', 'Your full name')}
          required
          error={errors.name}
        />
        <FormInput
          label={t('contact.form.phone', 'Phone')}
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="09xxxxxxxxx"
          required
          error={errors.phone}
        />
      </div>

      <FormInput
        label={t('contact.form.email', 'Email')}
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@example.com"
        required
        error={errors.email}
      />

      <FormTextarea
        label={t('contact.form.message', 'Message')}
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder={t('contact.form.messagePlaceholder', 'How can we help you?')}
        required
        error={errors.message}
      />

      {finalError && (
        <div className="px-4 py-3 text-sm text-[#e8363c] bg-[#e8363c]/10 border border-[#e8363c]/30 rounded-md">
          {finalError}
        </div>
      )}

      {status.type === 'success' && (
        <div className="px-4 py-3 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          {status.msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="self-start px-8 py-3 text-sm font-bold uppercase tracking-wide text-white bg-[#e8363c] hover:bg-[#d81c22] disabled:opacity-60 disabled:cursor-not-allowed rounded-md transition-colors"
        style={{ fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {loading ? t('contact.sending', 'Sending...') : t('contact.send', 'Send Message')}
      </button>
    </form>
  );
};

export default ContactForm;