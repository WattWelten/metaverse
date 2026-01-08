import { useState } from 'react';

export interface TemplateSwitcherProps {
  currentTemplate: string;
  availableTemplates: string[];
  onSwitch: (templateId: string) => void;
}

export function TemplateSwitcher({
  currentTemplate,
  availableTemplates,
  onSwitch,
}: TemplateSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 100,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Template: {currentTemplate} {isOpen ? '▲' : '▼'}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: '8px',
            background: '#1e293b',
            borderRadius: '4px',
            padding: '8px',
            minWidth: '200px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          }}
        >
          {availableTemplates.map((templateId) => (
            <button
              key={templateId}
              onClick={() => {
                onSwitch(templateId);
                setIsOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                background: templateId === currentTemplate ? '#3b82f6' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '4px',
              }}
            >
              {templateId}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
