import { List, FileText } from "lucide-react";

/**
 * Single search result row with type icon, highlighted headline, and metadata.
 */
export function SearchResultItem({ result, onClick }) {
  const isListResult = result.result_type === "list";
  const Icon = isListResult ? List : FileText;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 hover:bg-cream dark:hover:bg-slate-800 transition-colors flex items-start gap-3 border-b border-gray-50 dark:border-slate-700/50 last:border-b-0"
      role="option"
    >
      <div className="mt-0.5 shrink-0">
        <Icon
          size={14}
          className={
            isListResult
              ? "text-teal-700 dark:text-teal-400"
              : "text-gray-400 dark:text-gray-500"
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={`inline-block text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
            isListResult
              ? "text-teal-700 dark:text-teal-400"
              : "text-gray-400"
          }`}
        >
          {isListResult ? "List" : "Item"}
        </span>

        {/* Headline with highlighted matches via <mark> from ts_headline */}
        <p
          className="text-sm text-charcoal dark:text-white truncate [&_mark]:bg-yellow-200/60 [&_mark]:dark:bg-yellow-500/30 [&_mark]:text-charcoal [&_mark]:dark:text-white [&_mark]:rounded [&_mark]:px-0.5"
          dangerouslySetInnerHTML={{ __html: result.headline }}
        />

        {/* Notes/description context if it contains highlighted matches */}
        {result.description_headline &&
          result.description_headline.includes("<mark>") && (
            <p
              className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 [&_mark]:bg-yellow-200/40 [&_mark]:dark:bg-yellow-500/20 [&_mark]:rounded [&_mark]:px-0.5"
              dangerouslySetInnerHTML={{
                __html: result.description_headline,
              }}
            />
          )}

        {!isListResult && result.priority && (
          <span
            className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
              result.priority === "high"
                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                : result.priority === "medium"
                  ? "text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                  : "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
            }`}
          >
            {result.priority.toUpperCase()}
          </span>
        )}
      </div>
    </button>
  );
}
