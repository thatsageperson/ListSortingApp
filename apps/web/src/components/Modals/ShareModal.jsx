import { X } from "lucide-react";

/**
 * Modal to share the active list with another user by email and permission (view/edit).
 */
export function ShareModal({
  isOpen,
  onClose,
  shareEmail,
  setShareEmail,
  sharePermission,
  setSharePermission,
  onShare,
  isPending,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-surface w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Share List</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-charcoal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full bg-cream dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-teal-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Permission
            </label>
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="w-full bg-cream dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-teal-700 dark:text-white"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>
          <button
            onClick={onShare}
            disabled={!shareEmail || isPending}
            className="w-full bg-teal-700 text-white py-4 rounded-2xl font-bold hover:bg-teal-800 disabled:opacity-50"
          >
            {isPending ? "Sharing..." : "Share List"}
          </button>
        </div>
      </div>
    </div>
  );
}
