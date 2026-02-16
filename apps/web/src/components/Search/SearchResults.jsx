import { Loader2, List } from "lucide-react";
import { SearchResultItem } from "./SearchResultItem";

/**
 * Dropdown body showing search results grouped by list, with loading/empty/error states.
 */
export function SearchResults({
  groupedResults,
  total,
  hasMore,
  isSearching,
  error,
  onResultClick,
}) {
  if (error) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (isSearching && groupedResults.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="animate-spin text-teal-700" size={20} />
      </div>
    );
  }

  if (!isSearching && groupedResults.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-gray-500">No results found</p>
      </div>
    );
  }

  const displayedCount = groupedResults.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="overflow-y-auto max-h-[280px]">
      {/* Result count */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
        <span className="text-xs text-gray-500">
          Found {total} result{total !== 1 ? "s" : ""}
        </span>
      </div>

      {groupedResults.map((group) => (
        <div key={group.listId}>
          <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700 sticky top-0">
            <div className="flex items-center gap-2">
              <List size={12} className="text-teal-700 dark:text-teal-400" />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
                {group.listName}
              </span>
              <span className="text-[10px] text-gray-400 ml-auto">
                {group.items.length} match{group.items.length !== 1 ? "es" : ""}
              </span>
            </div>
          </div>
          {group.items.map((result, index) => (
            <SearchResultItem
              key={`${result.result_type}-${result.item_id || result.list_id}-${index}`}
              result={result}
              onClick={() => onResultClick(result)}
            />
          ))}
        </div>
      ))}

      {hasMore && (
        <div className="px-4 py-2 text-center border-t border-gray-100 dark:border-slate-700">
          <span className="text-xs text-gray-500">
            {total - displayedCount} more result{total - displayedCount !== 1 ? "s" : ""} not shown
          </span>
        </div>
      )}

      {isSearching && groupedResults.length > 0 && (
        <div className="flex justify-center py-2 border-t border-gray-100 dark:border-slate-700">
          <Loader2 className="animate-spin text-teal-700" size={14} />
        </div>
      )}
    </div>
  );
}
