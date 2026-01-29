import { X } from "lucide-react";
import { NewListStep1 } from "./NewListStep1";
import { NewListStep2 } from "./NewListStep2";
import { NewListStep3 } from "./NewListStep3";

export function NewListModal({
  isOpen,
  onClose,
  newListStep,
  setNewListStep,
  newListName,
  setNewListName,
  newListPurpose,
  setNewListPurpose,
  isAnalyzing,
  analyzedRules,
  onAnalyze,
  onCreate,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">
            Create New List
          </h2>
          <button
            onClick={onClose}
            className="text-[#70757F] hover:text-[#1E1E1E]"
          >
            <X size={24} />
          </button>
        </div>

        {newListStep === 1 && (
          <NewListStep1
            newListName={newListName}
            setNewListName={setNewListName}
            onNext={() => setNewListStep(2)}
          />
        )}

        {newListStep === 2 && (
          <NewListStep2
            newListName={newListName}
            newListPurpose={newListPurpose}
            setNewListPurpose={setNewListPurpose}
            onAnalyze={onAnalyze}
            isAnalyzing={isAnalyzing}
          />
        )}

        {newListStep === 3 && analyzedRules && (
          <NewListStep3
            analyzedRules={analyzedRules}
            onBack={() => setNewListStep(2)}
            onCreate={onCreate}
          />
        )}
      </div>
    </div>
  );
}
