/**
 * Welcome screen shown when no chat messages exist.
 */
export function ChatWelcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] pt-12">
      <img
        src="/jot-app-icon.svg"
        alt=""
        className="w-16 h-16 mb-6 rounded-2xl object-contain"
      />
      <p className="text-gray-500 text-center mb-3 max-w-md">
        Type in tasks, groceries, ideas, or anything else. I'll automatically
        sort them into your lists.
      </p>
      <h2 className="text-lg lg:text-xl font-semibold text-center text-charcoal dark:text-white mb-12">
        What do you need to jot down?
      </h2>
    </div>
  );
}
