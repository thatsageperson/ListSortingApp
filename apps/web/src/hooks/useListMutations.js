import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useListMutations(activeTab, setActiveTab) {
  const queryClient = useQueryClient();

  const createListMutation = useMutation({
    mutationFn: async (newList) => {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newList),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["lists"]);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (id) => {
      await fetch(`/api/lists/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries(["lists"]);
      if (activeTab === String(deletedId)) setActiveTab("chat");
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ itemId, completed }) => {
      const res = await fetch(`/api/lists/${activeTab}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, completed }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["items", activeTab]);
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
      queryClient.invalidateQueries(["items", activeTab]);
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
    toggleItemMutation,
    deleteItemMutation,
    shareListMutation,
  };
}
