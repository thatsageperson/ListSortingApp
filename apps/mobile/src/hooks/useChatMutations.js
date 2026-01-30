import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/utils/api';

export function useChatMutations(setChatHistory, setMessage) {
  const queryClient = useQueryClient();

  const processInputMutation = useMutation({
    mutationFn: async (input) => {
      const res = await apiFetch('/api/process-input', {
        method: 'POST',
        body: JSON.stringify({ input }),
      });
      return res.json();
    },
    onMutate: async (input) => {
      setChatHistory((prev) => [...prev, { role: 'user', content: input }]);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      if (data.items && data.items.length > 0) {
        const itemSummary = data.items
          .map((i) => `'${i.content}' to ${i.listName}`)
          .join(', ');
        setChatHistory((prev) => [
          ...prev,
          { role: 'ai', content: `Success! I've added ${itemSummary}.` },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'ai',
            content:
              data.message ||
              "I couldn't find a list for those items. Try creating a new list or being more specific!",
          },
        ]);
      }
      setMessage('');
    },
  });

  return { processInputMutation };
}
