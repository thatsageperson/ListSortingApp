import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ListHeader } from "./ListHeader";
import { ListItem } from "./ListItem";
import { NoteModal } from "@/components/Modals/NoteModal";

/**
 * Main list view for the active list: header with share/export, loading state, list items, or empty state.
 */
function sortItems(items, sortBy) {
  const sorted = [...items];
  if (sortBy === "priority") {
    const order = { high: 0, medium: 1, low: 2 };
    sorted.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
  } else if (sortBy === "alphabetical") {
    sorted.sort((a, b) => (a.content || "").localeCompare(b.content || ""));
  }
  // "created" is the default DB order, no sort needed

  // Stable-sort pinned items to top regardless of sort mode
  sorted.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
  return sorted;
}

const DENSITY_CLASSES = {
  compact: "space-y-1",
  comfortable: "space-y-3",
  spacious: "space-y-5",
};

export function ListView({
  activeList,
  activeListItems,
  isLoadingItems,
  setIsShareModalOpen,
  setIsExportModalOpen,
  onEditList,
  updateItemMutation,
  deleteItemMutation,
  showCompleted = true,
  defaultSort = "created",
  listDensity = "comfortable",
}) {
  const [noteModalItem, setNoteModalItem] = useState(null);
  const queryClient = useQueryClient();

  let items = activeListItems;
  if (!showCompleted) {
    items = items.filter((i) => !i.completed);
  }
  items = sortItems(items, defaultSort);

  const handleNewNote = async () => {
    try {
      const res = await fetch(`/api/lists/${activeList.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "Untitled Note",
          type: "note",
          display_mode: "note",
        }),
      });
      if (res.ok) {
        const newItem = await res.json();
        queryClient.invalidateQueries({ queryKey: ["listItems", activeList.id] });
        setNoteModalItem(newItem);
      }
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  const handleNoteUpdate = (fields) => {
    updateItemMutation.mutate(fields);
    // Update local modal state so pin status reflects immediately
    if (noteModalItem && fields.itemId === noteModalItem.id) {
      setNoteModalItem((prev) => ({ ...prev, ...fields }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ListHeader
        activeList={activeList}
        setIsShareModalOpen={setIsShareModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        onEditList={onEditList}
        onNewNote={handleNewNote}
      />

      {isLoadingItems ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-teal-700" size={32} />
        </div>
      ) : items.length > 0 ? (
        <div className={DENSITY_CLASSES[listDensity] || "space-y-3"}>
          {items.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              density={listDensity}
              onUpdate={(fields) => updateItemMutation.mutate(fields)}
              onDelete={(itemId) => deleteItemMutation.mutate(itemId)}
              onNoteClick={(item) => setNoteModalItem(item)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-surface rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-700">
          <p className="text-gray-500">
            This list is empty. Add items in the chat!
          </p>
        </div>
      )}

      <NoteModal
        item={noteModalItem}
        onClose={() => setNoteModalItem(null)}
        onUpdate={handleNoteUpdate}
        onDelete={(itemId) => {
          deleteItemMutation.mutate(itemId);
          setNoteModalItem(null);
        }}
      />
    </div>
  );
}
