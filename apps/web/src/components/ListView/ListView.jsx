import { Loader2 } from "lucide-react";
import { ListHeader } from "./ListHeader";
import { ListItem } from "./ListItem";

export function ListView({
  activeList,
  activeListItems,
  isLoadingItems,
  setIsShareModalOpen,
  setIsExportModalOpen,
  toggleItemMutation,
  deleteItemMutation,
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <ListHeader
        activeList={activeList}
        setIsShareModalOpen={setIsShareModalOpen}
        setIsExportModalOpen={setIsExportModalOpen}
      />

      {isLoadingItems ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[#219079]" size={32} />
        </div>
      ) : activeListItems.length > 0 ? (
        <div className="space-y-3">
          {activeListItems.map((item) => (
            <ListItem
              key={item.id}
              item={item}
              onToggle={(itemId, completed) =>
                toggleItemMutation.mutate({ itemId, completed })
              }
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
