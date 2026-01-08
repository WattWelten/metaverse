import { CSSProperties, ReactNode, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface AppleTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  style?: CSSProperties;
  className?: string;
}

export function AppleTabs({ tabs, defaultTab, style, className = '' }: AppleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {/* Tab Headers */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--glass-border)',
          marginBottom: '20px',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: 'none',
              borderBottom:
                activeTab === tab.id
                  ? '2px solid var(--color-system-blue)'
                  : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--color-label)' : 'var(--color-label-secondary)',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s var(--ease-out)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-system)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1 }}>{activeTabContent}</div>
    </div>
  );
}
