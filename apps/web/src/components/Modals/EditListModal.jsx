import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

/**
 * Modal for editing list name, description, and AI matching rules.
 */
export function EditListModal({
  isOpen,
  onClose,
  activeList,
  onSave,
  isSaving,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(activeList?.name || "");
    setDescription(activeList?.description || "");
    setRules(activeList?.rules || "");
  }, [isOpen, activeList]);

  if (!isOpen || !activeList) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      rules: rules.trim() || null,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Edit List</h2>
          <button
            onClick={onClose}
            className="text-[#70757F] hover:text-[#1E1E1E]"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#70757F] mb-2">
              List Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="List name"
              className="w-full bg-[#F7F7F7] dark:bg-[#262626] border-none rounded-2xl px-6 py-4 text-lg outline-none focus:ring-2 ring-[#219079] dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#70757F] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Short summary shown under the list title."
              className="w-full min-h-[90px] bg-[#F7F7F7] dark:bg-[#262626] border-none rounded-2xl px-6 py-4 text-base outline-none focus:ring-2 ring-[#219079] dark:text-white resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#70757F] mb-2">
              AI Matching Instructions
            </label>
            <textarea
              value={rules}
              onChange={(event) => setRules(event.target.value)}
              placeholder="Tell the AI what belongs in this list."
              className="w-full min-h-[120px] bg-[#F7F7F7] dark:bg-[#262626] border-none rounded-2xl px-6 py-4 text-base outline-none focus:ring-2 ring-[#219079] dark:text-white resize-none"
            />
            <p className="text-xs text-[#A8ADB4] mt-2">
              These rules are used when the AI assigns new items to lists.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="w-full bg-[#219079] text-white py-4 rounded-2xl font-bold hover:bg-[#1a7359] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
