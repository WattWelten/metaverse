import { CSSProperties, ReactNode } from 'react';

interface AppleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive';
  style?: CSSProperties;
  className?: string;
}

export function AppleButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  style,
  className = '',
}: AppleButtonProps) {
  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      background: 'var(--color-system-blue)',
      color: 'white',
    },
    secondary: {
      background: 'var(--color-fill-primary)',
      color: 'var(--color-label)',
    },
    destructive: {
      background: 'var(--color-system-red)',
      color: 'white',
    },
  };

  return (
    <button
      className={`btn-apple ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
