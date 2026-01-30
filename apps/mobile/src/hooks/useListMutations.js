import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api';

export function useListMutations(activeTab, setActiveTab) {
  const queryClient = useQueryClient();

  const createListMutation = useMutation({
    mutationFn: async (newList) => {
      const res = await apiFetch('/api/lists', {
        method: 'POST',
        body: JSON.stringify(newList),
      });
      if (!res.ok) throw new Error('Failed to create list');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id) => {
      await apiFetch(`/api/lists/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['lists'] });
      if (activeTab === String(deletedId)) setActiveTab('chat');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (fields) => {
      const res = await apiFetch(`/api/lists/${activeTab}/items`, {
        method: 'PUT',
        body: JSON.stringify(fields),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', activeTab] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await apiFetch(`/api/lists/${activeTab}/items`, {
        method: 'DELETE',
        body: JSON.stringify({ itemId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', activeTab] });
    },
  });

  return {
    createListMutation,
    deleteListMutation,
    updateItemMutation,
    deleteItemMutation,
  };
}
