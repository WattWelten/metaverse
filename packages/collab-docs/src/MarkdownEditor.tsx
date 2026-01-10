import { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface MarkdownEditorProps {
  roomId: string;
  ywsUrl?: string;
}

export function MarkdownEditor({ roomId, ywsUrl }: MarkdownEditorProps) {
  const doc = useMemo(() => new Y.Doc(), []);
  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: 'Schreib mit Markdown...' })],
    content: '## Gemeinsame Notizen\n\n',
  });

  useEffect(() => {
    if (!editor) return;

    const ytext = doc.getText('content');
    const wsUrl =
      ywsUrl ||
      `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:${location.port}/yws?room=${roomId}`;

    const provider = new WebsocketProvider(wsUrl, `md-${roomId}`, doc);

    // Sync editor -> yjs
    const updateYjs = () => {
      const content = editor.getHTML();
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    };

    editor.on('update', updateYjs);

    // Sync yjs -> editor
    ytext.observe(() => {
      const content = ytext.toString();
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    });

    return () => {
      editor.off('update', updateYjs);
      provider.destroy();
    };
  }, [doc, editor, roomId, ywsUrl]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <EditorContent editor={editor} />
    </div>
  );
}
