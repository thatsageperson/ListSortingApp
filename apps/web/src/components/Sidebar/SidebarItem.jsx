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
            ? "bg-[#F1F1F1] dark:bg-[#262626] text-[#1E1E1E] dark:text-white font-bold"
            : "text-[#70757F] dark:text-[#A8ADB4] hover:bg-[#F7F7F7] dark:hover:bg-[#1E1E1E]"
        }`}
      >
        <Icon
          size={18}
          className={`mr-3 ${isActive ? "text-[#1E1E1E] dark:text-white" : "text-[#A8ADB4] dark:text-[#70757F]"}`}
        />
        <span className="text-sm truncate pr-6">{label}</span>
      </button>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 p-1 text-[#70757F] opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
