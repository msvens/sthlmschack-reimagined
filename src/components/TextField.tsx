'use client';

import { ChangeEvent } from 'react';

export interface TextFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  margin?: 'none' | 'dense' | 'normal';
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  fullWidth = false,
  multiline = false,
  rows = 1,
  margin = 'none',
  placeholder,
  type = 'text',
  disabled = false,
}: TextFieldProps) {
  const marginClass = {
    none: '',
    dense: 'mt-2',
    normal: 'mt-4',
  }[margin];

  const widthClass = fullWidth ? 'w-full' : '';

  const baseInputClasses = `
    px-3 py-2
    bg-transparent
    border border-gray-300 dark:border-gray-600
    rounded
    text-gray-900 dark:text-white
    placeholder:text-gray-600 dark:placeholder:text-gray-400
    focus:outline-none
    focus:border-blue-500
    hover:border-gray-900 dark:hover:border-white
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${widthClass}
  `;

  return (
    <div className={`${marginClass} ${widthClass}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
        >
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={`${baseInputClasses} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={baseInputClasses}
        />
      )}
    </div>
  );
}