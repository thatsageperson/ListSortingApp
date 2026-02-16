import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

/**
 * TipTap rich text editor wrapper.
 * Pass onEditorReady to get a reference to the editor instance (for toolbar).
 */
export function NoteEditor({
  content,
  onChange,
  onEditorReady,
  placeholder,
  editable = true,
  className = "",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "note-link" },
      }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Start writing...",
      }),
    ],
    content: content || null,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  useEffect(() => {
    if (editor) {
      onEditorReady?.(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Update content when it changes externally (e.g., opening a different note)
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(content);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(content || null);
      }
    }
  }, [editor, content]);

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
