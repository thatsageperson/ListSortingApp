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
      <div className="bg-[#219079]/5 p-4 rounded-2xl border border-[#219079]/20">
        <p className="text-sm text-[#219079]">
          Tell me what should go in <strong>{newListName}</strong>. I'll learn
          to recognize relevant items for you.
        </p>
      </div>
      <textarea
        value={newListPurpose}
        onChange={(e) => setNewListPurpose(e.target.value)}
        placeholder="e.g. This list is for places I want to visit. Look for city names, countries, or landmarks."
        className="w-full min-h-[120px] bg-[#F7F7F7] dark:bg-[#262626] border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-[#219079] dark:text-white resize-none"
      />
      <button
        disabled={!newListPurpose.trim() || isAnalyzing}
        onClick={onAnalyze}
        className="w-full bg-[#219079] text-white py-4 rounded-2xl font-bold transition-all hover:bg-[#1a7359] disabled:opacity-50 flex items-center justify-center gap-2"
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
