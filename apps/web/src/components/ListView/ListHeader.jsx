import { Share2, Download, Pencil, FilePlus } from "lucide-react";

/**
 * Header for the list view showing the list name, description, and share/export action buttons.
 */
export function ListHeader({
  activeList,
  setIsShareModalOpen,
  setIsExportModalOpen,
  onEditList,
  onNewNote,
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-charcoal dark:text-white">
          {activeList?.name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{activeList?.description}</p>
      </div>
      <div className="flex gap-2">
        {onNewNote && (
          <button
            onClick={onNewNote}
            className="p-3 bg-white dark:bg-slate-surface border border-gray-100 dark:border-slate-700 rounded-2xl hover:bg-cream dark:hover:bg-slate-800"
            title="New Note"
          >
            <FilePlus size={18} className="text-teal-700" />
          </button>
        )}
        {onEditList && (
          <button
            onClick={onEditList}
            className="p-3 bg-white dark:bg-slate-surface border border-gray-100 dark:border-slate-700 rounded-2xl hover:bg-cream dark:hover:bg-slate-800"
          >
            <Pencil size={18} className="text-teal-700" />
          </button>
        )}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="p-3 bg-white dark:bg-slate-surface border border-gray-100 dark:border-slate-700 rounded-2xl hover:bg-cream dark:hover:bg-slate-800"
        >
          <Share2 size={18} className="text-teal-700" />
        </button>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="p-3 bg-white dark:bg-slate-surface border border-gray-100 dark:border-slate-700 rounded-2xl hover:bg-cream dark:hover:bg-slate-800"
        >
          <Download size={18} className="text-teal-700" />
        </button>
      </div>
    </div>
  );
}
