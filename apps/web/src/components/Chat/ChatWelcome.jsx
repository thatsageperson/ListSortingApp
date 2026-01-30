import { BrainCircuit } from "lucide-react";

/**
 * Welcome screen shown when no chat messages exist.
 */
export function ChatWelcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] pt-12">
      <div className="w-16 h-16 bg-[#219079]/10 rounded-3xl flex items-center justify-center mb-6">
        <BrainCircuit size={32} className="text-[#219079]" />
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold text-center text-[#1E1E1E] dark:text-white mb-4">
        What can I organize for you?
      </h1>
      <p className="text-[#70757F] text-center mb-12 max-w-md">
        Type in tasks, groceries, ideas, or anything else. I'll automatically
        sort them into your lists.
      </p>
    </div>
  );
}
