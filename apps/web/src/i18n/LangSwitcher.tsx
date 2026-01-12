import React from 'react';
import { setLang, getLang } from './index';

export default function LangSwitcher(): React.JSX.Element {
  const current = getLang();

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 10000,
        display: 'flex',
        gap: '0.5rem',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '0.5rem',
        borderRadius: '4px',
      }}
    >
      <button
        onClick={() => setLang('de')}
        style={{
          padding: '0.25rem 0.5rem',
          background: current === 'de' ? '#667eea' : 'transparent',
          color: 'white',
          border: '1px solid #ccc',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      >
        DE
      </button>
      <button
        onClick={() => setLang('en')}
        style={{
          padding: '0.25rem 0.5rem',
          background: current === 'en' ? '#667eea' : 'transparent',
          color: 'white',
          border: '1px solid #ccc',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      >
        EN
      </button>
    </div>
  );
}
