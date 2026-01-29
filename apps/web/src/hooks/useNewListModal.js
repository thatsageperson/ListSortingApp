import { useState } from "react";

/**
 * Manages state and logic for the new-list modal: step, name, purpose, analyze request, and reset.
 */
export function useNewListModal() {
  const [newListStep, setNewListStep] = useState(1);
  const [newListName, setNewListName] = useState("");
  const [newListPurpose, setNewListPurpose] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedRules, setAnalyzedRules] = useState(null);

  /** Calls the analyze-purpose API and advances to step 3 with the returned rules. */
  const analyzePurpose = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/lists/analyze-purpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose: newListPurpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Analyze purpose failed:", data);
        setAnalyzedRules({ description: "Could not analyze purpose", rules: newListPurpose });
      } else {
        setAnalyzedRules(data);
      }
      setNewListStep(3);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /** Resets modal state to step 1 and clears name, purpose, and analyzed rules. */
  const resetModal = () => {
    setNewListStep(1);
    setNewListName("");
    setNewListPurpose("");
    setAnalyzedRules(null);
  };

  return {
    newListStep,
    setNewListStep,
    newListName,
    setNewListName,
    newListPurpose,
    setNewListPurpose,
    isAnalyzing,
    analyzedRules,
    analyzePurpose,
    resetModal,
  };
}
