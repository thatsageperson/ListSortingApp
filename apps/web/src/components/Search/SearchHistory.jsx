import { Clock, X, Trash2 } from "lucide-react";

/**
 * Dropdown body showing recent search history when the input is focused
 * but the query is shorter than 2 characters.
 */
export function SearchHistory({ history, onHistoryClick, onRemoveItem, onClear }) {
  if (history.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-sm text-gray-500">No recent searches</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100 dark:border-slate-700">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Recent Searches
        </span>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 size={10} />
          Clear
        </button>
      </div>
      <div className="py-1">
        {history.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="group flex items-center px-4 py-2.5 hover:bg-cream dark:hover:bg-slate-800 transition-colors"
          >
            <button
              onClick={() => onHistoryClick(item)}
              className="flex items-center gap-3 flex-1 text-left min-w-0"
            >
              <Clock size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm text-charcoal dark:text-white truncate">
                {item}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveItem(item);
              }}
              className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1 shrink-0"
              aria-label={`Remove "${item}" from history`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
