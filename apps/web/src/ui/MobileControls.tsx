import { useEffect, useRef, useState } from 'react';

interface MobileControlsProps {
  onMove?: (direction: { x: number; y: number }) => void;
  onJump?: () => void;
}

/**
 * Mobile Controls - On-screen Joystick for touch devices
 * Only renders when touch is detected
 */
export function MobileControls({ onMove, onJump }: MobileControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentTouchRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Check if touch is available
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsVisible(hasTouch);

    if (!hasTouch) return;

    const joystick = joystickRef.current;
    if (!joystick) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      touchStartRef.current = { x: centerX, y: centerY };
      currentTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      currentTouchRef.current = { x: touch.clientX, y: touch.clientY };

      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = rect.width / 2 - 20; // Leave some margin

      if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        currentTouchRef.current = {
          x: centerX + Math.cos(angle) * maxDistance,
          y: centerY + Math.sin(angle) * maxDistance,
        };
      }

      // Normalize direction (-1 to 1)
      const normalizedX = Math.max(-1, Math.min(1, dx / maxDistance));
      const normalizedY = Math.max(-1, Math.min(1, dy / maxDistance));

      // Dispatch synthetic keyboard events for PlayerController
      // PlayerController listens to 'keydown'/'keyup' events
      const dispatchKey = (code: string, down: boolean) => {
        const event = new KeyboardEvent(down ? 'keydown' : 'keyup', {
          code,
          key: code.replace('Key', '').toLowerCase(),
          bubbles: true,
          cancelable: true,
        });
        window.dispatchEvent(event);
      };

      // Map joystick direction to WASD keys
      // Y-axis: forward (W) / backward (S)
      if (normalizedY < -0.1) {
        dispatchKey('KeyW', true);
      } else {
        dispatchKey('KeyW', false);
      }
      if (normalizedY > 0.1) {
        dispatchKey('KeyS', true);
      } else {
        dispatchKey('KeyS', false);
      }

      // X-axis: left (A) / right (D)
      if (normalizedX < -0.1) {
        dispatchKey('KeyA', true);
      } else {
        dispatchKey('KeyA', false);
      }
      if (normalizedX > 0.1) {
        dispatchKey('KeyD', true);
      } else {
        dispatchKey('KeyD', false);
      }

      // Callback if provided
      if (onMove) {
        onMove({ x: normalizedX, y: normalizedY });
      }
    };

    const handleTouchEnd = () => {
      // Release all movement keys
      ['KeyW', 'KeyA', 'KeyS', 'KeyD'].forEach((code) => {
        const event = new KeyboardEvent('keyup', {
          code,
          key: code.replace('Key', '').toLowerCase(),
          bubbles: true,
          cancelable: true,
        });
        window.dispatchEvent(event);
      });

      touchStartRef.current = null;
      currentTouchRef.current = null;
      if (onMove) {
        onMove({ x: 0, y: 0 }); // Stop movement
      }
    };

    joystick.addEventListener('touchstart', handleTouchStart);
    joystick.addEventListener('touchmove', handleTouchMove);
    joystick.addEventListener('touchend', handleTouchEnd);
    joystick.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      joystick.removeEventListener('touchstart', handleTouchStart);
      joystick.removeEventListener('touchmove', handleTouchMove);
      joystick.removeEventListener('touchend', handleTouchEnd);
      joystick.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [onMove]);

  if (!isVisible) return null;

  const joystickCenter = currentTouchRef.current || touchStartRef.current;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {/* Joystick Base */}
      <div
        ref={joystickRef}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      >
        {/* Joystick Handle */}
        {joystickCenter && (
          <div
            style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              left: `${joystickCenter.x - 20}px`,
              top: `${joystickCenter.y - 20}px`,
              transform: 'translate(-50%, -50%)',
              transition: touchStartRef.current ? 'none' : 'all 0.2s ease-out',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Jump Button */}
      {onJump && (
        <div
          onTouchStart={(e) => {
            e.preventDefault();
            // Dispatch Space key for jump
            const event = new KeyboardEvent('keydown', {
              code: 'Space',
              key: ' ',
              bubbles: true,
              cancelable: true,
            });
            window.dispatchEvent(event);
            if (onJump) onJump();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            // Release Space key
            const event = new KeyboardEvent('keyup', {
              code: 'Space',
              key: ' ',
              bubbles: true,
              cancelable: true,
            });
            window.dispatchEvent(event);
          }}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(76, 175, 80, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            cursor: 'pointer',
            userSelect: 'none',
            zIndex: 1001,
            pointerEvents: 'auto',
            touchAction: 'none',
          }}
        >
          ⬆️
        </div>
      )}
    </div>
  );
}
