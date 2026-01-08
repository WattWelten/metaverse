import { CSSProperties, InputHTMLAttributes } from 'react';

interface AppleSliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'style'> {
  style?: CSSProperties;
  className?: string;
}

export function AppleSlider({ style, className = '', ...props }: AppleSliderProps) {
  return (
    <input
      type="range"
      className={className}
      style={{
        width: '100%',
        height: '4px',
        borderRadius: '2px',
        background: 'var(--color-fill-primary)',
        outline: 'none',
        WebkitAppearance: 'none',
        appearance: 'none',
        ...style,
      }}
      {...props}
    />
  );
}
