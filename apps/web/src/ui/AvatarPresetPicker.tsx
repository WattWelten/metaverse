import { AppleCard } from '@metaverse/ui';
import { useState } from 'react';

import { AvatarPreview } from './AvatarPreview';

interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  color?: string;
}

// Preset-Avatare (offline-tauglich)
const PRESETS: AvatarPreset[] = [
  {
    id: 'capsule',
    name: 'Standard (Capsule)',
    url: '/avatars/presets/capsule.glb',
    color: '#4CAF50',
  },
  {
    id: 'preset2',
    name: 'Preset 2',
    url: '/avatars/presets/capsule.glb', // Gleicher Dummy, anderes Material (UI-Placeholder)
    color: '#2196F3',
  },
  {
    id: 'preset3',
    name: 'Preset 3',
    url: '/avatars/presets/capsule.glb', // Gleicher Dummy, anderes Material (UI-Placeholder)
    color: '#FF9800',
  },
];

interface AvatarPresetPickerProps {
  selectedUrl?: string;
  onSelect: (url: string) => void;
}

export function AvatarPresetPicker({ selectedUrl, onSelect }: AvatarPresetPickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        padding: '8px',
      }}
    >
      {PRESETS.map((preset) => {
        const isSelected = selectedUrl === preset.url;
        const isHovered = hoveredId === preset.id;

        return (
          <AppleCard
            key={preset.id}
            onClick={() => onSelect(preset.url)}
            onMouseEnter={() => setHoveredId(preset.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              padding: '16px',
              cursor: 'pointer',
              border: isSelected
                ? '2px solid var(--color-system-blue)'
                : '1px solid var(--glass-border)',
              borderRadius: '12px',
              background: isSelected
                ? 'var(--color-fill-primary)'
                : isHovered
                  ? 'var(--color-fill-secondary)'
                  : 'transparent',
              transition: 'all 0.2s var(--ease-out)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isSelected
                ? '0 4px 12px rgba(0, 122, 255, 0.2)'
                : isHovered
                  ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                  : 'none',
              position: 'relative',
            }}
          >
            {/* Avatar Preview */}
            <div
              style={{
                width: '100%',
                height: '140px',
                marginBottom: '12px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--color-fill-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AvatarPreview avatarUrl={preset.url} width={140} height={140} />
            </div>

            {/* Preset Name */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? 'var(--color-label)' : 'var(--color-label-secondary)',
              }}
            >
              {preset.name}
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--color-system-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}
              >
                ✓
              </div>
            )}
          </AppleCard>
        );
      })}
    </div>
  );
}
