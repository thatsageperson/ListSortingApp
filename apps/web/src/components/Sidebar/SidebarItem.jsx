import { Trash2 } from "lucide-react";

/**
 * Single sidebar nav item with icon and label; optionally shows a delete button on hover.
 */
export function SidebarItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  onDelete,
}) {
  return (
    <div className="group relative flex items-center">
      <button
        onClick={onClick}
        className={`w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
          isActive
            ? "bg-cream dark:bg-slate-700 text-charcoal dark:text-white font-bold"
            : "text-gray-500 dark:text-gray-400 hover:bg-cream dark:hover:bg-slate-800"
        }`}
      >
        <Icon
          size={18}
          className={`mr-3 ${isActive ? "text-teal-700 dark:text-teal-400" : "text-gray-400 dark:text-gray-500"}`}
        />
        <span className="text-sm truncate pr-6">{label}</span>
      </button>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 p-1 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
