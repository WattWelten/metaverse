import React, { useState } from 'react';

import { AuthService } from '../auth/AuthService.js';
import { getFeatureFlags } from '../FeatureFlags.js';

interface LoginModalProps {
  onLogin: (session: { sessionId: string; user: { userId: string; username: string } }) => void;
  serverUrl?: string;
}

export function LoginModal({ onLogin, serverUrl = 'http://localhost:3001' }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flags = getFeatureFlags();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    if (username.trim().length > 50) {
      setError('Username must be less than 50 characters');
      return;
    }

    setLoading(true);

    try {
      // Solo-Modus: Lokale Session erstellen ohne Server
      if (!flags.MULTIPLAYER_ENABLED) {
        const localSession = {
          sessionId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user: {
            userId: `user-${Date.now()}`,
            username: username.trim(),
          },
        };
        // Session in localStorage speichern (für Konsistenz)
        localStorage.setItem('ww_session', JSON.stringify(localSession));
        onLogin(localSession);
        return;
      }

      // Multiplayer-Modus: Server-Login versuchen
      const authService = new AuthService(serverUrl);
      const session = await authService.login(username.trim());
      onLogin(session);
    } catch (err) {
      console.error('Login failed:', err);
      // Fallback zu Solo-Modus wenn Server nicht erreichbar
      if (!flags.MULTIPLAYER_ENABLED || (err instanceof Error && err.message.includes('fetch'))) {
        console.log('Falling back to local session (solo mode)');
        const localSession = {
          sessionId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user: {
            userId: `user-${Date.now()}`,
            username: username.trim(),
          },
        };
        localStorage.setItem('ww_session', JSON.stringify(localSession));
        onLogin(localSession);
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: 'var(--font-system, system-ui)',
      }}
    >
      <div
        className="glass"
        style={{
          background: 'var(--glass-background, rgba(20, 20, 20, 0.95))',
          backdropFilter: 'var(--glass-backdrop-blur, blur(20px))',
          WebkitBackdropFilter: 'var(--glass-backdrop-blur, blur(20px))',
          border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '420px',
          width: '90%',
          color: '#fff',
          fontFamily:
            'var(--font-system, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
          animation: 'slideUp 400ms var(--ease-spring, cubic-bezier(0.34, 1.56, 0.64, 1))',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        }}
      >
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.5px',
          }}
        >
          Willkommen im WattWelten Metaverse
        </h2>
        <p
          style={{
            margin: '0 0 32px 0',
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.5',
          }}
        >
          Gib deinen Benutzernamen ein, um dem Metaverse beizutreten
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={loading}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                fontFamily:
                  'var(--font-system, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.background = 'rgba(255, 255, 255, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: 'rgba(244, 67, 54, 0.2)',
                border: '1px solid rgba(244, 67, 54, 0.5)',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#ff5252',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            style={{
              width: '100%',
              padding: '14px 24px',
              background:
                loading || !username.trim()
                  ? 'rgba(76, 175, 80, 0.4)'
                  : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '17px',
              fontWeight: 600,
              cursor: loading || !username.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loading || !username.trim() ? 'none' : '0 4px 12px rgba(76, 175, 80, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading && username.trim()) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                loading || !username.trim() ? 'none' : '0 4px 12px rgba(76, 175, 80, 0.3)';
            }}
          >
            {loading ? 'Wird angemeldet...' : 'Metaverse betreten'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
