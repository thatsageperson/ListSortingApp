import { useEffect, useState, useCallback, useRef } from "react";
import { X, Save, Pin, PinOff, Trash2 } from "lucide-react";
import { NoteEditor } from "@/components/NoteEditor/NoteEditor";
import { NoteToolbar } from "@/components/NoteEditor/NoteToolbar";
import { extractPlainText } from "@/utils/extractPlainText";
import { format } from "date-fns";

/**
 * Full-screen modal for editing a rich text note.
 */
export function NoteModal({ item, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState("");
  const [richContent, setRichContent] = useState(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [editor, setEditor] = useState(null);
  const initialContentRef = useRef(null);

  // Populate state when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.content || "");
      setRichContent(item.rich_content || null);
      initialContentRef.current = JSON.stringify(item.rich_content || null);
      setHasUnsaved(false);
    }
  }, [item]);

  const handleEditorChange = useCallback((json) => {
    setRichContent(json);
    setHasUnsaved(true);
  }, []);

  const handleEditorReady = useCallback((editorInstance) => {
    setEditor(editorInstance);
  }, []);

  const handleSave = useCallback(() => {
    if (!item) return;
    const plainText = richContent ? extractPlainText(richContent) : "";
    onUpdate({
      itemId: item.id,
      content: title.trim() || "Untitled Note",
      notes: plainText || null,
      rich_content: richContent,
    });
    setHasUnsaved(false);
  }, [item, title, richContent, onUpdate]);

  const handleClose = useCallback(() => {
    if (hasUnsaved) {
      // Auto-save on close
      const plainText = richContent ? extractPlainText(richContent) : "";
      onUpdate({
        itemId: item.id,
        content: title.trim() || "Untitled Note",
        notes: plainText || null,
        rich_content: richContent,
      });
    }
    onClose();
  }, [hasUnsaved, item, title, richContent, onUpdate, onClose]);

  const handlePin = useCallback(() => {
    if (!item) return;
    onUpdate({ itemId: item.id, is_pinned: !item.is_pinned });
  }, [item, onUpdate]);

  const handleDelete = useCallback(() => {
    if (!item) return;
    onDelete(item.id);
    onClose();
  }, [item, onDelete, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (item) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [item, handleClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-surface w-full max-w-3xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasUnsaved(true);
            }}
            placeholder="Note title..."
            className="flex-1 text-xl font-bold bg-transparent border-none outline-none text-charcoal dark:text-white placeholder-gray-400"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePin}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={item.is_pinned ? "Unpin" : "Pin to Top"}
            >
              {item.is_pinned ? (
                <PinOff size={18} className="text-teal-700" />
              ) : (
                <Pin size={18} className="text-gray-500" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <Trash2 size={18} className="text-gray-500 hover:text-red-500" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
              title="Save"
            >
              <Save size={18} className="text-teal-700" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 border-b border-gray-100 dark:border-slate-700">
          <NoteToolbar editor={editor} />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <NoteEditor
            content={richContent}
            onChange={handleEditorChange}
            onEditorReady={handleEditorReady}
            placeholder="Start writing your note..."
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs text-gray-400">
          <span>
            {item.created_at && format(new Date(item.created_at), "MMM d, yyyy 'at' h:mm a")}
          </span>
          {hasUnsaved && (
            <span className="text-amber-500 font-medium">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}
