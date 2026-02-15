import { Loader2 } from "lucide-react";

/**
 * Second step: describe the list purpose and trigger AI analysis to finalize.
 */
export function NewListStep2({
  newListName,
  newListPurpose,
  setNewListPurpose,
  onAnalyze,
  isAnalyzing,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-teal-50 p-4 rounded-2xl border border-teal-100">
        <p className="text-sm text-teal-700">
          Tell me what should go in <strong>{newListName}</strong>. I'll learn
          to recognize relevant items for you.
        </p>
      </div>
      <textarea
        value={newListPurpose}
        onChange={(e) => setNewListPurpose(e.target.value)}
        placeholder="e.g. This list is for places I want to visit. Look for city names, countries, or landmarks."
        className="w-full min-h-[120px] bg-cream dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-teal-700 dark:text-white resize-none"
      />
      <button
        disabled={!newListPurpose.trim() || isAnalyzing}
        onClick={onAnalyze}
        className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold transition-all hover:bg-teal-800 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          "Finalize List"
        )}
      </button>
    </div>
  );
}
