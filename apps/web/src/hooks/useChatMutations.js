import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Provides the process-input mutation: sends user input to the API, updates chat history, and invalidates items.
 */
export function useChatMutations(setChatHistory, setMessage) {
  const queryClient = useQueryClient();

  const processInputMutation = useMutation({
    mutationFn: async (input) => {
      const res = await fetch("/api/process-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      // #region agent log
      if (!res.ok) {
        fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useChatMutations.js:mutationFn',message:'process-input res not ok',data:{status:res.status,ok:res.ok},timestamp:Date.now(),hypothesisId:'H5'})}).catch(()=>{});
      }
      // #endregion
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
      return data;
    },
    onMutate: async (input) => {
      setChatHistory((prev) => [...prev, { role: "user", content: input }]);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      if (data.items && data.items.length > 0) {
        const itemSummary = data.items
          .map((i) => `'${i.content}' to ${i.listName}`)
          .join(", ");
        setChatHistory((prev) => [
          ...prev,
          { role: "ai", content: `Success! I've added ${itemSummary}.` },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              data.message ||
              "I couldn't find a list for those items. Try creating a new list or being more specific!",
          },
        ]);
      }
      setMessage("");
    },
  });

  return { processInputMutation };
}
