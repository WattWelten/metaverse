export interface MenuProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSwitch?: (templateId: string) => void;
  availableTemplates?: string[];
}

export function Menu({
  visible,
  onClose,
  onTemplateSwitch,
  availableTemplates = ['watt-default'],
}: MenuProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1e293b',
          padding: '32px',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '600px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <h2 style={{ color: '#fff', margin: 0 }}>Menu</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {onTemplateSwitch && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#fff', marginBottom: '12px' }}>Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {availableTemplates.map((templateId) => (
                <button
                  key={templateId}
                  onClick={() => {
                    onTemplateSwitch(templateId);
                    onClose();
                  }}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {templateId}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <button
            onClick={onClose}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
