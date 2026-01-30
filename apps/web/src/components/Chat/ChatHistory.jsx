import { Loader2 } from "lucide-react";

/**
 * Renders the scrollable list of chat messages (user and assistant) and an optional loading indicator.
 * Uses a ref at the bottom for auto-scrolling to the latest message.
 */
export function ChatHistory({ chatHistory, isPending, chatEndRef }) {
  return (
    <div className="space-y-6 pb-20">
      {chatHistory.map((chat, idx) => (
        <div
          key={idx}
          className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] p-4 rounded-3xl ${
              chat.role === "user"
                ? "bg-[#219079] text-white rounded-tr-none"
                : "bg-white dark:bg-[#1E1E1E] text-[#1E1E1E] dark:text-white border border-[#EDEDED] dark:border-[#333333] rounded-tl-none shadow-sm"
            }`}
          >
            <p className="text-sm lg:text-base leading-relaxed">
              {chat.content}
            </p>
          </div>
        </div>
      ))}
      {isPending && (
        <div className="flex justify-start">
          <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-3xl rounded-tl-none border border-[#EDEDED] dark:border-[#333333] shadow-sm">
            <Loader2 className="animate-spin text-[#219079]" size={20} />
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
