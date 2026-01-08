import { CSSProperties } from 'react';

interface AppleSegmentedControlProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  style?: CSSProperties;
}

export function AppleSegmentedControl({
  options,
  value,
  onChange,
  style,
}: AppleSegmentedControlProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--color-fill-primary)',
        padding: '4px',
        borderRadius: '10px',
        fontFamily: 'var(--font-system)',
        ...style,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            background:
              value === option.value ? 'var(--color-background-secondary)' : 'transparent',
            color: value === option.value ? 'var(--color-label)' : 'var(--color-label-secondary)',
            fontFamily: 'var(--font-system)',
            fontSize: '15px',
            fontWeight: value === option.value ? 600 : 400,
            cursor: 'pointer',
            transition: 'all var(--duration-fast) var(--ease-out)',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
