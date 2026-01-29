import { X, Download, Mail, MessageSquare } from "lucide-react";

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  activeList,
  activeListItems,
}) {
  if (!isOpen) return null;

  const handleEmailExport = () => {
    const subject = encodeURIComponent(activeList?.name || "My List");
    const body = encodeURIComponent(
      activeListItems.map((i) => `• ${i.content}`).join("\n"),
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onClose();
  };

  const handleSMSExport = () => {
    const body = encodeURIComponent(
      `${activeList?.name || "My List"}:\n${activeListItems.map((i) => `• ${i.content}`).join("\n")}`,
    );
    window.location.href = `sms:?&body=${body}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Export List</h2>
          <button
            onClick={onClose}
            className="text-[#70757F] hover:text-[#1E1E1E]"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => onExport("ics")}
            className="w-full bg-[#F7F7F7] dark:bg-[#262626] hover:bg-[#219079] hover:text-white dark:hover:bg-[#219079] text-[#1E1E1E] dark:text-white p-4 rounded-2xl font-medium transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Download size={18} />
              <div>
                <div className="font-bold">Apple Reminders</div>
                <div className="text-xs opacity-70">Export as .ics file</div>
              </div>
            </div>
          </button>
          <button
            onClick={() => onExport("text")}
            className="w-full bg-[#F7F7F7] dark:bg-[#262626] hover:bg-[#219079] hover:text-white dark:hover:bg-[#219079] text-[#1E1E1E] dark:text-white p-4 rounded-2xl font-medium transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Download size={18} />
              <div>
                <div className="font-bold">Plain Text / Notes</div>
                <div className="text-xs opacity-70">Export as .txt file</div>
              </div>
            </div>
          </button>
          <button
            onClick={handleEmailExport}
            className="w-full bg-[#F7F7F7] dark:bg-[#262626] hover:bg-[#219079] hover:text-white dark:hover:bg-[#219079] text-[#1E1E1E] dark:text-white p-4 rounded-2xl font-medium transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <div>
                <div className="font-bold">Email</div>
                <div className="text-xs opacity-70">Send via email</div>
              </div>
            </div>
          </button>
          <button
            onClick={handleSMSExport}
            className="w-full bg-[#F7F7F7] dark:bg-[#262626] hover:bg-[#219079] hover:text-white dark:hover:bg-[#219079] text-[#1E1E1E] dark:text-white p-4 rounded-2xl font-medium transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={18} />
              <div>
                <div className="font-bold">Text Message</div>
                <div className="text-xs opacity-70">Send via SMS</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
