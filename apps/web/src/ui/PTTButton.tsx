import { useEffect, useState } from 'react';

interface PTTButtonProps {
  onPTTStart: () => void;
  onPTTEnd: () => void;
  disabled?: boolean;
}

export function PTTButton({ onPTTStart, onPTTEnd, disabled }: PTTButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // V-Taste für Push-to-Talk
      if (e.key === 'v' || e.key === 'V') {
        if (!isPressed && !disabled) {
          e.preventDefault();
          setIsPressed(true);
          onPTTStart();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V') {
        if (isPressed) {
          e.preventDefault();
          setIsPressed(false);
          onPTTEnd();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPressed, disabled, onPTTStart, onPTTEnd]);

  return (
    <button
      onMouseDown={() => {
        if (!disabled && !isPressed) {
          setIsPressed(true);
          onPTTStart();
        }
      }}
      onMouseUp={() => {
        if (isPressed) {
          setIsPressed(false);
          onPTTEnd();
        }
      }}
      onMouseLeave={() => {
        if (isPressed) {
          setIsPressed(false);
          onPTTEnd();
        }
      }}
      disabled={disabled}
      style={{
        padding: '1rem 2rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        background: isPressed ? '#f00' : '#0f0',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.1s',
      }}
      data-testid="ptt-button"
    >
      {isPressed ? '🎤 Speaking...' : '🎤 Push to Talk (V)'}
    </button>
  );
}
