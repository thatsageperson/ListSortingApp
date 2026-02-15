import { Navigation, Loader2 } from "lucide-react";

/**
 * Text input and send button for the chat. Supports Enter to send and shows a loading state while a message is being sent.
 */
export function ChatInput({ message, setMessage, onSend, isPending }) {
  return (
    <div className="px-6 py-6 lg:px-12 lg:pb-12 bg-gradient-to-t from-cream dark:from-slate-bg to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-surface border border-gray-200 dark:border-slate-700 rounded-[32px] p-2 shadow-xl shadow-black/5 flex items-end">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Milk, eggs, finish report, call Sarah..."
            className="flex-1 bg-transparent border-none outline-none resize-none px-6 py-4 text-lg text-charcoal dark:text-white placeholder-gray-400"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={!message.trim() || isPending}
            className="mb-2 mr-2 w-12 h-12 bg-orange-sunset rounded-2xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Navigation size={20} className="rotate-45" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 mt-4">
          jot. AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
