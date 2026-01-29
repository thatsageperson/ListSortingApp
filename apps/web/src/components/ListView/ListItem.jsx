import { Check, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

/**
 * Single list item with checkbox (tasks) or timestamp icon (logs), content, priority badge, and delete button.
 */
export function ListItem({ item, onToggle, onDelete }) {
  const isLog = item.type === "log";
  const isStrikethrough = !isLog && item.completed;

  /** Returns Tailwind classes for the given priority level (high/medium/low). */
  const getPriorityColor = (priority) => {
    if (priority === "high")
      return "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    if (priority === "medium")
      return "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    if (priority === "low")
      return "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    return "";
  };

  /** Formats a date for display: relative for today, "Yesterday at ..." for yesterday, full date otherwise. */
  const formatTimestamp = (date) => {
    const d = new Date(date);
    if (isToday(d)) {
      return formatDistanceToNow(d, { addSuffix: true });
    } else if (isYesterday(d)) {
      return "Yesterday at " + format(d, "h:mm a");
    } else {
      return format(d, "MMM d, yyyy 'at' h:mm a");
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-[#EDEDED] dark:border-[#333333] flex items-start justify-between group">
      <div className="flex items-start gap-3 flex-1">
        {isLog ? (
          <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
            <Clock size={16} className="text-[#219079]" />
          </div>
        ) : (
          <button
            onClick={() => onToggle(item.id, !item.completed)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${
              item.completed
                ? "bg-[#219079] border-[#219079]"
                : "border-[#E2E2E2] dark:border-[#333333] hover:border-[#219079]"
            }`}
          >
            {item.completed && <Check size={14} className="text-white" />}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <span
            className={`text-[#1E1E1E] dark:text-white block ${isStrikethrough ? "line-through opacity-50" : ""}`}
          >
            {item.content}
          </span>
          {item.notes && (
            <span className="text-sm text-[#70757F] dark:text-[#9BA1AD] block mt-0.5">
              {item.notes}
            </span>
          )}
          <div className="flex items-center gap-2 mt-1">
            {item.priority && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(item.priority)}`}
              >
                {item.priority.toUpperCase()}
              </span>
            )}
            {item.created_at && (
              <span className="text-xs text-[#70757F]">
                {formatTimestamp(item.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        className="text-[#70757F] opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-3 shrink-0"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
