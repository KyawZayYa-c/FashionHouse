import React from 'react';

const SectionHeading = ({ subtitle, title, align = 'left' }) => {
  const alignClass =
    align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-2 ${alignClass}`}>
      {subtitle && (
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {subtitle}
        </span>
      )}
      <h2
        className="text-3xl md:text-4xl font-bold text-black dark:text-white tracking-tight"
        style={{ fontFamily: 'IBM Plex Mono, monospace' }}
      >
        {title}
      </h2>
    </div>
  );
};

export default SectionHeading;