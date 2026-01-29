import { Share2, Download } from "lucide-react";

export function ListHeader({
  activeList,
  setIsShareModalOpen,
  setIsExportModalOpen,
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1E1E1E] dark:text-white">
          {activeList?.name}
        </h1>
        <p className="text-sm text-[#70757F] mt-1">{activeList?.description}</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="p-3 bg-white dark:bg-[#1E1E1E] border border-[#EDEDED] dark:border-[#333333] rounded-2xl hover:bg-[#F7F7F7] dark:hover:bg-[#262626]"
        >
          <Share2 size={18} className="text-[#219079]" />
        </button>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="p-3 bg-white dark:bg-[#1E1E1E] border border-[#EDEDED] dark:border-[#333333] rounded-2xl hover:bg-[#F7F7F7] dark:hover:bg-[#262626]"
        >
          <Download size={18} className="text-[#219079]" />
        </button>
      </div>
    </div>
  );
}
