import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  ...rest
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-semibold text-black dark:text-white"
          style={{ fontFamily: 'IBM Plex Mono, monospace' }}
        >
          {label}
          {required && <span className="text-[#e8363c] ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 text-black dark:text-white border rounded-md outline-none transition-colors
          ${error
            ? 'border-[#e8363c] focus:border-[#e8363c]'
            : 'border-gray-200 dark:border-gray-700 focus:border-[#e8363c]'
          }`}
        {...rest}
      />
      {error && <span className="text-xs text-[#e8363c]">{error}</span>}
    </div>
  );
};

export default FormInput;