import { Menu, Moon, Sun } from "lucide-react";

/**
 * Mobile-only header with menu button to open the sidebar and dark mode toggle.
 */
export function MobileHeader({ setSidebarOpen, darkMode, toggleDarkMode }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-[#121212] border-b border-[#EDEDED] dark:border-[#333333] z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mr-3 p-1 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] rounded-2xl transition-colors"
        >
          <Menu size={24} className="text-[#1E1E1E] dark:text-white" />
        </button>
        <span className="text-lg font-medium dark:text-white">Smart</span>
        <span className="text-lg font-medium text-[#219079] ml-1">Lists</span>
      </div>
      <button
        onClick={toggleDarkMode}
        className="p-2 hover:bg-[#F7F7F7] dark:hover:bg-[#262626] rounded-2xl"
      >
        {darkMode ? (
          <Sun size={20} className="text-white" />
        ) : (
          <Moon size={20} className="text-[#1E1E1E]" />
        )}
      </button>
    </div>
  );
}
