import { CSSProperties, ReactNode } from 'react';

interface AppleCardProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}

export function AppleCard({ children, onClick, style, className = '' }: AppleCardProps) {
  return (
    <div
      className={`glass ${className}`}
      onClick={onClick}
      style={{
        background: 'var(--glass-background)',
        backdropFilter: 'var(--glass-backdrop-blur)',
        WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--duration-fast) var(--ease-out)',
        ...(onClick && {
          ':hover': {
            transform: 'scale(1.02)',
            borderColor: 'var(--color-system-blue)',
          },
        }),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.borderColor = 'var(--color-system-blue)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
        }
      }}
    >
      {children}
    </div>
  );
}
