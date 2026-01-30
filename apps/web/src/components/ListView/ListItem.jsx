import { useState, useRef, useEffect } from "react";
import { Check, Trash2, Clock, Circle, MoreVertical } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

const DISPLAY_MODES = [
  { value: "todo-strike", label: "Task (Strikethrough)" },
  { value: "todo-no-strike", label: "Task (No Strikethrough)" },
  { value: "bullet", label: "Bullet Point" },
  { value: "log-clock", label: "Log (Clock)" },
];

/**
 * Single list item with dynamic icon based on display_mode, three-dot format menu, and delete button.
 */
const DENSITY_PADDING = {
  compact: "p-2",
  comfortable: "p-4",
  spacious: "p-6",
};

export function ListItem({ item, onUpdate, onDelete, density = "comfortable" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const mode = item.display_mode || (item.type === "log" ? "log-clock" : "todo-strike");
  const showCheckbox = mode === "todo-strike" || mode === "todo-no-strike";
  const isStrikethrough = mode === "todo-strike" && item.completed;

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const getPriorityColor = (priority) => {
    if (priority === "high")
      return "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    if (priority === "medium")
      return "text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
    if (priority === "low")
      return "text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    return "";
  };

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

  const renderIcon = () => {
    if (mode === "log-clock") {
      return (
        <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
          <Clock size={16} className="text-[#219079]" />
        </div>
      );
    }
    if (mode === "bullet") {
      return (
        <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
          <Circle size={8} className="text-[#70757F] fill-current" />
        </div>
      );
    }
    // todo-strike or todo-no-strike
    return (
      <button
        onClick={() => onUpdate({ itemId: item.id, completed: !item.completed })}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-0.5 ${
          item.completed
            ? "bg-[#219079] border-[#219079]"
            : "border-[#E2E2E2] dark:border-[#333333] hover:border-[#219079]"
        }`}
      >
        {item.completed && <Check size={14} className="text-white" />}
      </button>
    );
  };

  return (
    <div className={`bg-white dark:bg-[#1E1E1E] ${DENSITY_PADDING[density] || "p-4"} rounded-2xl border border-[#EDEDED] dark:border-[#333333] flex items-start justify-between group`}>
      <div className="flex items-start gap-3 flex-1">
        {renderIcon()}
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
      <div className="flex items-center gap-1 ml-3 shrink-0">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#70757F] opacity-0 group-hover:opacity-100 hover:text-[#1E1E1E] dark:hover:text-white transition-opacity p-1"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white dark:bg-[#262626] border border-[#EDEDED] dark:border-[#333333] rounded-xl shadow-lg z-10 py-1 w-52">
              {DISPLAY_MODES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onUpdate({ itemId: item.id, display_mode: opt.value });
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-[#F7F7F7] dark:hover:bg-[#333333] transition-colors ${
                    mode === opt.value
                      ? "text-[#219079] font-medium"
                      : "text-[#1E1E1E] dark:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="text-[#70757F] opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
