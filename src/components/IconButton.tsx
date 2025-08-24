import { ComponentType, SVGProps } from 'react';

type IconButtonSize = 'small' | 'medium' | 'large' | 'nav';

interface IconButtonProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  size?: IconButtonSize;
  disabled?: boolean;
  title?: string;
  className?: string;
  iconClassName?: string;
  style?: React.CSSProperties;
}

const sizeClasses = {
  small: {
    button: 'w-8 h-8',
    icon: 'w-4 h-4'
  },
  medium: {
    button: 'w-10 h-10',
    icon: 'w-6 h-6'
  },
  large: {
    button: 'w-16 h-16',
    icon: 'w-8 h-8 stroke-[1.25]'
  },
  nav: {
    button: 'w-12 h-12',
    icon: 'w-8 h-8 stroke-[1.5]'
  }
};

export function IconButton({
  icon: Icon,
  onClick,
  size = 'medium',
  disabled = false,
  title,
  className = '',
  iconClassName = '',
  style = {}
}: IconButtonProps) {
  const { button: buttonSize, icon: iconSize } = sizeClasses[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center rounded-full
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-90
        transition-all duration-150
        ${buttonSize}
        ${className}`}
      style={{
        color: 'var(--color-mui-text-primary)',
        backgroundColor: 'transparent',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-mui-background-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Icon className={`${iconSize} ${iconClassName}`} />
    </button>
  );
}
