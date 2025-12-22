import { useEffect, useRef, useState } from 'react';

export interface OverlayHostProps {
  templateId: string;
  onAction?: (action: { type: string; payload?: unknown }) => void;
}

export function OverlayHost({ templateId, onAction }: OverlayHostProps) {
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!shadowHostRef.current) return;

    // Shadow DOM erstellen
    let shadowRoot = shadowRootRef.current;
    if (!shadowRoot) {
      shadowRoot = shadowHostRef.current.attachShadow({ mode: 'open' });
      shadowRootRef.current = shadowRoot;
    }

    // Template-HTML laden
    loadTemplateOverlay(templateId, shadowRoot, onAction)
      .then(() => setLoaded(true))
      .catch(() => {
        // Silently handle template overlay errors - fallback is loaded
        // Errors are expected when template partials don't exist
        loadFallbackOverlay(shadowRoot);
        setLoaded(true);
      });

    return () => {
      // Cleanup bei Unmount
      if (shadowRoot) {
        shadowRoot.innerHTML = '';
      }
    };
  }, [templateId, onAction]);

  return (
    <div
      ref={shadowHostRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: loaded ? 'auto' : 'none',
        zIndex: 10,
      }}
    />
  );
}

async function loadTemplateOverlay(
  templateId: string,
  shadowRoot: ShadowRoot,
  onAction?: (action: { type: string; payload?: unknown }) => void
): Promise<void> {
  try {
    // Manifest laden
    const manifestResponse = await fetch(`/templates/${templateId}/manifest.json`);
    if (!manifestResponse.ok) {
      throw new Error(`Failed to load manifest: ${manifestResponse.statusText}`);
    }

    // Check Content-Type before parsing JSON
    const contentType = manifestResponse.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      throw new Error(`Expected JSON but got ${contentType}`);
    }

    const manifest = await manifestResponse.json();

    // UI-Skin CSS laden
    let cssText = '';
    try {
      const cssResponse = await fetch(`/templates/${templateId}/ui-skin.css`);
      if (cssResponse.ok) {
        cssText = await cssResponse.text();
      }
    } catch {
      // CSS optional
    }

    // HTML-Partials laden
    let htmlText = '';
    try {
      const htmlResponse = await fetch(`/templates/${templateId}/partials/main.html`);
      if (htmlResponse.ok) {
        const htmlContentType = htmlResponse.headers.get('content-type');
        // Only use response if it's actually HTML, not a 404 page
        if (htmlContentType && htmlContentType.includes('text/html')) {
          htmlText = await htmlResponse.text();
          // Check if response is actually HTML (not a 404 page)
          if (htmlText.trim().startsWith('<!DOCTYPE') && htmlText.includes('404')) {
            // This is a 404 page, use fallback
            htmlText = generateMinimalHTML(manifest);
          }
        } else {
          htmlText = generateMinimalHTML(manifest);
        }
      } else {
        // Fallback: Generiere minimales HTML
        htmlText = generateMinimalHTML(manifest);
      }
    } catch (error) {
      // Silently fallback to minimal HTML
      htmlText = generateMinimalHTML(manifest);
    }

    // In Shadow DOM einfügen
    shadowRoot.innerHTML = `
      <style>
        ${cssText}
        :host {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      </style>
      ${htmlText}
    `;

    // Event-Listener für Buttons
    shadowRoot.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = (e.target as HTMLElement).dataset.action;
        const payload = (e.target as HTMLElement).dataset.payload;
        try {
          onAction?.({
            type: action || 'unknown',
            payload: payload ? JSON.parse(payload) : undefined,
          });
        } catch (parseError) {
          // Silently handle JSON parse errors
          console.warn('Failed to parse action payload:', parseError);
        }
      });
    });

    // Focus-Trap für Accessibility
    setupFocusTrap(shadowRoot);
  } catch (error) {
    // Don't log as error - this is expected when partials don't exist
    // Fallback will be handled by caller
    throw error;
  }
}

function generateMinimalHTML(manifest: { name?: string }): string {
  return `
    <div class="metaverse-overlay">
      <nav class="metaverse-navbar">
        <div class="navbar-brand">${manifest.name || 'Metaverse'}</div>
        <div class="navbar-actions">
          <button data-action="open-menu" class="btn-menu">☰</button>
        </div>
      </nav>
    </div>
  `;
}

function loadFallbackOverlay(shadowRoot: ShadowRoot): void {
  shadowRoot.innerHTML = `
    <style>
      .metaverse-navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        padding: 1rem 2rem;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        backdrop-filter: blur(10px);
        z-index: 1000;
      }
      .navbar-brand {
        font-size: 1.25rem;
        font-weight: 600;
      }
      .btn-menu {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.25rem;
      }
      .btn-menu:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    </style>
    <div class="metaverse-navbar">
      <div class="navbar-brand">WattWelten Metaverse</div>
      <button class="btn-menu" data-action="open-menu">☰</button>
    </div>
  `;
}

function setupFocusTrap(shadowRoot: ShadowRoot): void {
  // Focus-Trap für Accessibility (vereinfacht)
  const focusableElements = shadowRoot.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  shadowRoot.addEventListener('keydown', (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key !== 'Tab') return;

    if (ke.shiftKey) {
      if (document.activeElement === firstElement) {
        ke.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        ke.preventDefault();
        firstElement.focus();
      }
    }
  });
}
