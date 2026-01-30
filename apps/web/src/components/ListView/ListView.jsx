import { Loader2 } from "lucide-react";
import { ListHeader } from "./ListHeader";
import { ListItem } from "./ListItem";

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
  let items = activeListItems;
  if (!showCompleted) {
    items = items.filter((i) => !i.completed);
  }
  items = sortItems(items, defaultSort);

  return (
    <div className="max-w-4xl mx-auto">
      <ListHeader
        activeList={activeList}
        setIsShareModalOpen={setIsShareModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
        onEditList={onEditList}
      />

      {isLoadingItems ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#219079]" size={32} />
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
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#1E1E1E] rounded-3xl border-2 border-dashed border-[#EDEDED] dark:border-[#333333]">
          <p className="text-[#70757F]">
            This list is empty. Add items in the chat!
          </p>
        </div>
      )}
    </div>
  );
}
