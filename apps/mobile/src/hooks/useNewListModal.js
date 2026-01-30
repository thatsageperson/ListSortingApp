import { useState } from 'react';
import { apiFetch } from '@/utils/api';

export function useNewListModal() {
  const [newListStep, setNewListStep] = useState(1);
  const [newListName, setNewListName] = useState('');
  const [newListPurpose, setNewListPurpose] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedRules, setAnalyzedRules] = useState(null);

  const analyzePurpose = async () => {
    setIsAnalyzing(true);
    try {
      const res = await apiFetch('/api/lists/analyze-purpose', {
        method: 'POST',
        body: JSON.stringify({ purpose: newListPurpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAnalyzedRules({ description: 'Could not analyze purpose', rules: newListPurpose });
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

  const resetModal = () => {
    setNewListStep(1);
    setNewListName('');
    setNewListPurpose('');
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
