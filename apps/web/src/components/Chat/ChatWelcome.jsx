import { BrainCircuit, List } from "lucide-react";

export function ChatWelcome({ lists }) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {lists.slice(0, 4).map((l) => (
          <div
            key={l.id}
            className="bg-white dark:bg-[#1E1E1E] p-4 rounded-2xl border border-[#EDEDED] dark:border-[#333333] flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-[#219079]/10 flex items-center justify-center text-[#219079]">
              <List size={16} />
            </div>
            <span className="text-sm font-medium dark:text-white">
              {l.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
