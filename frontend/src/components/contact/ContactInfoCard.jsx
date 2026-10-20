import React from 'react';

const ContactInfoCard = ({ icon: Icon, title, lines = [], href }) => {
  const Wrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, className: 'group' }
    : { className: 'group' };

  return (
    <Wrapper
      {...wrapperProps}
      className="flex flex-col items-start gap-3 p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:border-[#e8363c] transition-colors"
    >
      <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#e8363c]/10 text-[#e8363c] group-hover:bg-[#e8363c] group-hover:text-white transition-colors">
        {Icon && <Icon size={20} strokeWidth={1.7} />}
      </div>

      <h3
        className="text-base font-bold text-black dark:text-white"
        style={{ fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {title}
      </h3>

      <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {lines.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </Wrapper>
  );
};

export default ContactInfoCard;