import { BrainCircuit } from "lucide-react";
import { Logo } from "@/components/Logo";

/**
 * Welcome screen shown when no chat messages exist.
 */
export function ChatWelcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] pt-12">
      <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center mb-6">
        <BrainCircuit size={32} className="text-teal-700" />
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold text-center text-charcoal dark:text-white mb-3">
        What can I organize for you?
      </h1>
      <Logo size="small" className="mb-4" />
      <p className="text-gray-500 text-center mb-12 max-w-md">
        Type in tasks, groceries, ideas, or anything else. I'll automatically
        sort them into your lists.
      </p>
    </div>
  );
}
