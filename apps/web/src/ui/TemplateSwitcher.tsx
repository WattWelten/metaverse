import { useEffect, useState } from 'react';

import { getFeatureFlags } from '../FeatureFlags';
import {
  loadIndex,
  persistTemplateId,
  setTemplateQueryParam,
  type TemplateInfo,
} from '../templates/TemplateRegistry';

interface TemplateSwitcherProps {
  className?: string;
  onTemplateChange?: (templateId: string) => void | Promise<void>;
}

export function TemplateSwitcher({ className = '', onTemplateChange }: TemplateSwitcherProps) {
  const flags = getFeatureFlags();
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [currentId, setCurrentId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Feature-Flag prüfen (default: true)
  const enabled = flags.TEMPLATE_SWITCH !== false;

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    loadIndex()
      .then((index) => {
        setTemplates(index.items);
        // Aktuelle Template-ID aus Query oder LocalStorage
        const query = new URLSearchParams(location.search).get('template');
        const ls = localStorage.getItem('template.id');
        setCurrentId(query || ls || index.default);
        setLoading(false);
      })
      .catch((error) => {
        console.error('[TemplateSwitcher] Failed to load templates:', error);
        setLoading(false);
      });
  }, [enabled]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setCurrentId(newId);
    persistTemplateId(newId);
    setTemplateQueryParam(newId);

    // Hot-Swap ohne Reload
    if (onTemplateChange) {
      try {
        await onTemplateChange(newId);
        console.log(`[TemplateSwitcher] Template switched to: ${newId}`);
      } catch (error) {
        console.error('[TemplateSwitcher] Failed to switch template:', error);
        // Revert selection on error
        const query = new URLSearchParams(location.search).get('template');
        const ls = localStorage.getItem('template.id');
        setCurrentId(query || ls || 'watt-eco');
      }
    } else {
      // Fallback: Reload page if no callback provided
      location.reload();
    }
  };

  if (!enabled || loading || templates.length === 0) {
    return null;
  }

  if (templates.length === 1) {
    // Nur ein Template verfügbar, kein Switcher nötig
    return null;
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label
        htmlFor="template-switcher"
        style={{
          fontSize: '12px',
          color: 'var(--color-label-secondary, #999)',
          whiteSpace: 'nowrap',
        }}
      >
        Template:
      </label>
      <select
        id="template-switcher"
        value={currentId}
        onChange={handleChange}
        style={{
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '4px',
          border: '1px solid var(--color-separator, #ddd)',
          background: 'var(--color-fill-primary, #fff)',
          color: 'var(--color-label, #000)',
          cursor: 'pointer',
        }}
      >
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.name}
          </option>
        ))}
      </select>
    </div>
  );
}
