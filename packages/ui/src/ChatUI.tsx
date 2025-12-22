import { useEffect, useRef, useState } from 'react';

export interface ChatMessage {
  userId: string;
  message: string;
  timestamp: number;
}

export interface ChatUIProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId?: string;
  visible?: boolean;
  onToggle?: () => void;
}

export function ChatUI({
  messages,
  onSendMessage,
  currentUserId,
  visible = true,
  onToggle,
}: ChatUIProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (!visible) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '12px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          backdropFilter: 'blur(10px)',
          zIndex: 200,
        }}
      >
        💬 Chat
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '320px',
        maxHeight: '400px',
        background: 'rgba(0, 0, 0, 0.85)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontWeight: '600', color: '#fff', fontSize: '14px' }}>Chat</div>
        {onToggle && (
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              width: '24px',
              height: '24px',
            }}
          >
            ×
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '300px',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', textAlign: 'center' }}>
            Noch keine Nachrichten
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.userId === currentUserId;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isOwn ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    background: isOwn ? 'rgba(33, 150, 243, 0.8)' : 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    maxWidth: '80%',
                    fontSize: '13px',
                    wordWrap: 'break-word',
                  }}
                >
                  {!isOwn && (
                    <div
                      style={{
                        fontSize: '11px',
                        opacity: 0.7,
                        marginBottom: '4px',
                      }}
                    >
                      {msg.userId.substring(0, 8)}...
                    </div>
                  )}
                  <div>{msg.message}</div>
                  <div
                    style={{
                      fontSize: '10px',
                      opacity: 0.6,
                      marginTop: '4px',
                    }}
                  >
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nachricht eingeben..."
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onToggle?.();
              }
            }}
          />
          <button
            type="submit"
            style={{
              background: 'rgba(33, 150, 243, 0.8)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Senden
          </button>
        </div>
      </form>
    </div>
  );
}
