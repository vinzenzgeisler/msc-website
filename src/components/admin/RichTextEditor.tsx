import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { MediaAssetPicker } from '@/components/admin/MediaAssetPicker';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ImagePlus,
  FolderOpen,
  Undo,
  Redo,
  Minus,
  Loader2,
} from 'lucide-react';
import { pb } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full mx-auto my-4',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Artikeltext verfassen...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-4 focus:outline-none',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const normalizedIncoming = content || '';
    const normalizedCurrent = editor.getHTML();

    if (normalizedCurrent === normalizedIncoming) {
      return;
    }

    editor.commands.setContent(normalizedIncoming, { emitUpdate: false });
  }, [editor, content]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Nur Bilddateien erlaubt');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bild darf max. 10 MB groß sein');
      return;
    }

    setUploading(true);
    try {
      // Upload to a dedicated "media" collection in PocketBase
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', file.name);

      const record = await pb.collection('media').create(formData);
      const url = pb.files.getURL(record, record.file);

      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      toast.success('Bild eingefügt');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Bild-Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageUpload(file);
      e.target.value = '';
    },
    [handleImageUpload],
  );

  if (!editor) return null;

  return (
    <div className="rounded-md border border-input bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Fett"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Kursiv"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Überschrift 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Überschrift 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Aufzählung"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Nummerierte Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Trennlinie"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-6 w-px bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Bild einfügen"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </Button>

        <MediaAssetPicker
          onSelect={() => {}}
          onSelectUrl={(url, alt) => {
            if (editor) {
              editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
            }
          }}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Bild aus Medien"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          }
        />

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Rückgängig"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Wiederholen"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
