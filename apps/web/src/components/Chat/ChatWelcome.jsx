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
        To get started, open the menu and create at least one list,
        <br />
        it's where all your jots will land.
      </p>
      <h2 className="text-xl lg:text-2xl font-extralight italic text-center text-charcoal dark:text-white mb-12 tracking-wider" style={{ fontFamily: 'var(--font-logo)' }}>
        What do you need to jot down?
      </h2>
    </div>
  );
}
