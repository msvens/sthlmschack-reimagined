import { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

type ButtonVariant = 'text' | 'outlined' | 'contained';
type ButtonColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  href?: string;
  className?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}

const colorStyles = {
  default: {
    text: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    outlined: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    contained: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
  },
  primary: {
    text: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30',
    outlined: 'border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30',
    contained: 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
  },
  secondary: {
    text: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30',
    outlined: 'border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30',
    contained: 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
  },
  success: {
    text: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30',
    outlined: 'border border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30',
    contained: 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
  },
  warning: {
    text: 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30',
    outlined: 'border border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30',
    contained: 'bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700',
  },
  error: {
    text: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30',
    outlined: 'border border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30',
    contained: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
  },
};

export function Button({
  children,
  variant = 'contained',
  color = 'default',
  href,
  className = '',
  startIcon,
  endIcon,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 rounded transition-colors';
  const widthStyles = fullWidth ? 'w-full' : '';
  const variantStyles = colorStyles[color][variant];

  const combinedStyles = `${baseStyles} ${widthStyles} ${variantStyles} ${className}`;

  const content = (
    <>
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedStyles} {...props}>
      {content}
    </button>
  );
}