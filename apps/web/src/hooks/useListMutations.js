import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Provides mutations for lists and items: create list, delete list, toggle item, delete item, and share list.
 */
export function useListMutations(activeTab, setActiveTab) {
  const queryClient = useQueryClient();

  const createListMutation = useMutation({
    mutationFn: async (newList) => {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newList),
      });
      if (!res.ok) throw new Error("Failed to create list");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/lists/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      if (activeTab === String(deletedId)) setActiveTab("chat");
    },
  });

  const updateListMutation = useMutation({
    mutationFn: async ({ listId, name, description, rules }) => {
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, rules }),
      });
      if (!res.ok) throw new Error("Failed to update list");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (fields) => {
      const res = await fetch(`/api/lists/${activeTab}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", activeTab] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId) => {
      await fetch(`/api/lists/${activeTab}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items", activeTab] });
    },
  });

  const shareListMutation = useMutation({
    mutationFn: async ({ listId, email, permission }) => {
      const res = await fetch(`/api/lists/${listId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, permission }),
      });
      return res.json();
    },
  });

  return {
    createListMutation,
    deleteListMutation,
    updateListMutation,
    updateItemMutation,
    deleteItemMutation,
    shareListMutation,
  };
}
