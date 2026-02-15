import { ChevronRight } from "lucide-react";

/**
 * First step of the new-list flow: enter list name and proceed to purpose step.
 */
export function NewListStep1({ newListName, setNewListName, onNext }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-2">
          List Name
        </label>
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="e.g. Travel Bucket List"
          className="w-full bg-cream dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-teal-700 dark:text-white"
        />
      </div>
      <button
        disabled={!newListName.trim()}
        onClick={onNext}
        className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold transition-all hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Next <ChevronRight size={18} />
      </button>
    </div>
  );
}
