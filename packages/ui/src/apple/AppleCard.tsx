import { CSSProperties, ReactNode, MouseEvent } from 'react';

interface AppleCardProps {
  children: ReactNode;
  onClick?: () => void;
  onMouseEnter?: (e: MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
  className?: string;
}

export function AppleCard({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  style,
  className = '',
}: AppleCardProps) {
  return (
    <div
      className={`glass ${className}`}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.borderColor = 'var(--color-system-blue)';
        }
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'var(--glass-border)';
        }
        onMouseLeave?.(e);
      }}
      style={{
        background: 'var(--glass-background)',
        backdropFilter: 'var(--glass-backdrop-blur)',
        WebkitBackdropFilter: 'var(--glass-backdrop-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--duration-fast) var(--ease-out)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
