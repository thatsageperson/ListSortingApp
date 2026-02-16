import { Menu, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * Mobile-only header with menu button to open the sidebar and dark mode toggle.
 */
export function MobileHeader({ setSidebarOpen, darkMode, toggleDarkMode }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-surface border-b border-gray-200 dark:border-slate-700 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="mr-3 p-1 hover:bg-cream dark:hover:bg-slate-800 rounded-2xl transition-colors"
        >
          <Menu size={24} className="text-charcoal dark:text-white" />
        </button>
        <Logo size="small" />
      </div>
      <button
        onClick={toggleDarkMode}
        className="p-2 hover:bg-cream dark:hover:bg-slate-800 rounded-2xl"
      >
        {darkMode ? (
          <Sun size={20} className="text-white" />
        ) : (
          <Moon size={20} className="text-charcoal" />
        )}
      </button>
    </div>
  );
}
