import {
  List,
  Plus,
  Settings,
  Home,
  HelpCircle,
  X,
  Loader2,
  Moon,
  Sun,
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { Logo } from "@/components/Logo";

/**
 * Left sidebar: branding, dark mode toggle, new list button, chat/list nav, and settings/sign out.
 */
export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  toggleDarkMode,
  setIsNewListModalOpen,
  activeTab,
  setActiveTab,
  lists,
  isLoadingLists,
  deleteListMutation,
  onSettingsClick,
}) {
  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-surface border-r border-gray-200 dark:border-slate-700 transition-all duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 w-64 flex flex-col`}
    >
      <div className="p-6 pt-8 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => { setActiveTab("chat"); setSidebarOpen(false); }}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Logo size="small" className="mr-1" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-1 text-gray-500 hover:text-charcoal dark:hover:text-white hidden lg:block"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsNewListModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-2xl font-medium mb-6 transition-colors shadow-lg shadow-teal-700/20"
        >
          <Plus size={18} />
          <span>New List</span>
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <div className="pb-2 px-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              My Lists
            </span>
          </div>
          {isLoadingLists ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-teal-700" size={20} />
            </div>
          ) : (
            lists.map((list) => (
              <SidebarItem
                key={list.id}
                icon={List}
                label={list.name}
                isActive={activeTab === String(list.id)}
                onClick={() => {
                  setActiveTab(String(list.id));
                  setSidebarOpen(false);
                }}
                onDelete={() => deleteListMutation.mutate(list.id)}
              />
            ))
          )}
        </nav>

        <div className="pt-6 border-t border-gray-200 dark:border-slate-700 space-y-1">
          <SidebarItem
            icon={Home}
            label="Home"
            isActive={activeTab === "chat"}
            onClick={() => { setActiveTab("chat"); setSidebarOpen(false); }}
          />
          <SidebarItem icon={Settings} label="Settings" onClick={onSettingsClick} />
          <a href="/account/logout" className="block">
            <SidebarItem icon={HelpCircle} label="Sign Out" />
          </a>
        </div>
      </div>
    </div>
  );
}
