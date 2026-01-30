/**
 * Final step: show AI understanding and matching rules, then create list or go back.
 */
export function NewListStep3({ analyzedRules, onBack, onCreate }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-bold text-[#A8ADB4] uppercase tracking-wider">
            AI Understanding
          </span>
          <p className="text-sm dark:text-white mt-1">
            {analyzedRules.description}
          </p>
        </div>
        <div className="bg-[#F7F7F7] dark:bg-[#262626] p-4 rounded-2xl">
          <span className="text-[10px] font-bold text-[#A8ADB4] uppercase tracking-wider">
            Matching Logic
          </span>
          <p className="text-xs text-[#70757F] mt-2 italic">
            "{analyzedRules.rules}"
          </p>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 bg-[#F1F1F1] dark:bg-[#262626] text-[#1E1E1E] dark:text-white py-4 rounded-2xl font-bold"
        >
          Back
        </button>
        <button
          onClick={onCreate}
          className="flex-[2] bg-[#219079] text-white py-4 rounded-2xl font-bold hover:bg-[#1a7359]"
        >
          Create List
        </button>
      </div>
    </div>
  );
}
