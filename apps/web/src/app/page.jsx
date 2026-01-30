import React, { useState, useEffect, useRef } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useListMutations } from "@/hooks/useListMutations";
import { useChatMutations } from "@/hooks/useChatMutations";
import { useNewListModal } from "@/hooks/useNewListModal";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { MobileHeader } from "@/components/MobileHeader/MobileHeader";
import { ChatWelcome } from "@/components/Chat/ChatWelcome";
import { ChatHistory } from "@/components/Chat/ChatHistory";
import { ChatInput } from "@/components/Chat/ChatInput";
import { ListView } from "@/components/ListView/ListView";
import { ExportModal } from "@/components/Modals/ExportModal";
import { ShareModal } from "@/components/Modals/ShareModal";
import { NewListModal } from "@/components/Modals/NewListModal/NewListModal";
import { EditListModal } from "@/components/Modals/EditListModal";
import { SettingsModal } from "@/components/Modals/SettingsModal";
import { useSettings } from "@/hooks/useSettings";

/**
 * Main SmartLists page: sidebar, chat/list view, modals, and guest mode support.
 */
export default function SmartListsPage() {
  const chatEndRef = useRef(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("view");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check for guest mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsGuestMode(localStorage.getItem("guestMode") === "true");
    }
  }, []);

  const { settings, updateSetting } = useSettings();
  const { darkMode, toggleDarkMode } = useDarkMode(settings.darkMode);

  // Apply font size setting
  useEffect(() => {
    const sizes = { small: "14px", medium: "16px", large: "18px", xl: "20px" };
    document.documentElement.style.fontSize = sizes[settings.fontSize] || "16px";
  }, [settings.fontSize]);

  const queryClient = useQueryClient();
  const {
    newListStep,
    setNewListStep,
    newListName,
    setNewListName,
    newListPurpose,
    setNewListPurpose,
    isAnalyzing,
    analyzedRules,
    analyzePurpose,
    resetModal,
  } = useNewListModal();

  // Get user first before using in queries
  const { data: user, loading: userLoading } = useUser();

  // Queries
  const { data: lists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ["lists", isGuestMode],
    queryFn: async () => {
      if (isGuestMode) {
        const guestLists = localStorage.getItem("guestLists");
        return guestLists ? JSON.parse(guestLists) : [];
      }
      const res = await fetch("/api/lists");
      if (!res.ok) throw new Error("Failed to fetch lists");
      return res.json();
    },
    // TEMPORARILY ENABLED FOR TESTING - no auth required
    enabled: true,
  });

  const { data: activeListItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["items", activeTab, isGuestMode],
    queryFn: async () => {
      if (activeTab === "chat") return [];
      if (isGuestMode) {
        const guestItems = localStorage.getItem(`guestItems_${activeTab}`);
        return guestItems ? JSON.parse(guestItems) : [];
      }
      const res = await fetch(`/api/lists/${activeTab}/items`);
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    // TEMPORARILY ENABLED FOR TESTING - no auth required
    enabled: activeTab !== "chat",
  });

  // Mutations
  const { processInputMutation } = useChatMutations(setChatHistory, setMessage);
  const {
    createListMutation,
    deleteListMutation,
    updateListMutation,
    updateItemMutation,
    deleteItemMutation,
    shareListMutation,
  } = useListMutations(activeTab, setActiveTab);

  /** Closes the new-list modal and resets its state. */
  const closeNewListModal = () => {
    setIsNewListModalOpen(false);
    resetModal();
  };

  /** Sends the current chat message via the process-input mutation. */
  const handleSendMessage = () => {
    if (message.trim()) {
      processInputMutation.mutate(message);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const activeList = lists.find((l) => String(l.id) === activeTab);

  /** Exports the active list in the given format (ics/text) and closes the export modal. */
  const handleExport = (format) => {
    const includeCompleted = settings.exportIncludeCompleted;
    window.location.href = `/api/lists/${activeTab}/export?format=${format}&includeCompleted=${includeCompleted}`;
    updateSetting("lastExportFormat", format);
    setIsExportModalOpen(false);
  };

  /** Shares the active list with the entered email and permission via the share mutation. */
  const handleShareList = () => {
    if (!shareEmail) return;
    shareListMutation.mutate(
      {
        listId: activeTab,
        email: shareEmail,
        permission: sharePermission,
      },
      {
        onSuccess: () => {
          setIsShareModalOpen(false);
          setShareEmail("");
          alert("List shared successfully!");
        },
      },
    );
  };

  const canEditList =
    !activeList?.role || activeList?.role === "owner" || activeList?.role === "edit";

  /** Updates the active list name/description/rules and closes the modal. */
  const handleUpdateList = ({ name, description, rules }) => {
    if (!activeList) return;
    if (isGuestMode) {
      const updatedList = { ...activeList, name, description, rules };
      const nextLists = lists.map((list) =>
        String(list.id) === String(activeList.id) ? updatedList : list,
      );
      localStorage.setItem("guestLists", JSON.stringify(nextLists));
      queryClient.setQueryData(["lists", isGuestMode], nextLists);
      setIsEditListModalOpen(false);
      return;
    }

    updateListMutation.mutate(
      { listId: activeList.id, name, description, rules },
      {
        onSuccess: () => setIsEditListModalOpen(false),
      },
    );
  };

  /** Creates the new list with analyzed rules and closes the new-list modal. */
  const handleCreateList = () => {
    createListMutation.mutate(
      {
        name: newListName,
        description: analyzedRules.description,
        rules: analyzedRules.rules,
      },
      {
        onSuccess: closeNewListModal,
      },
    );
  };

  // Show loading or redirect to signin if not authenticated
  // TEMPORARILY DISABLED FOR TESTING
  /*
  if (userLoading && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A]">
        <Loader2 className="animate-spin text-[#219079]" size={48} />
      </div>
    );
  }

  if (!user && !isGuestMode) {
    if (typeof window !== "undefined") {
      window.location.href = "/account/signin";
    }
    return null;
  }
  */

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] font-inter flex">
      <MobileHeader
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Guest Mode Banner */}
      {isGuestMode && (
        <div className="fixed top-16 lg:top-0 left-0 right-0 bg-gradient-to-r from-[#219079] to-[#1a7359] text-white py-3 px-6 flex items-center justify-between z-50 lg:ml-64">
          <div className="flex items-center gap-2">
            <UserPlus size={20} />
            <span className="text-sm font-medium">
              You're using Guest Mode. Sign up to save your lists permanently!
            </span>
          </div>
          <a
            href="/account/signup"
            className="bg-white text-[#219079] px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
          >
            Sign Up
          </a>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        setIsNewListModalOpen={setIsNewListModalOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lists={lists}
        isLoadingLists={isLoadingLists}
        deleteListMutation={deleteListMutation}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col h-screen pt-16 lg:pt-0 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
        <div
          className={`flex-1 overflow-y-auto px-6 py-8 lg:px-12 lg:py-12 ${isGuestMode ? "pt-20 lg:pt-20" : ""}`}
        >
          {activeTab === "chat" ? (
            <div className="max-w-3xl mx-auto space-y-8">
              {chatHistory.length === 0 ? (
                <ChatWelcome />
              ) : (
                <ChatHistory
                  chatHistory={chatHistory}
                  isPending={processInputMutation.isPending}
                  chatEndRef={chatEndRef}
                />
              )}
            </div>
          ) : (
            <ListView
              activeList={activeList}
              activeListItems={activeListItems}
              isLoadingItems={isLoadingItems}
              showCompleted={settings.showCompleted}
              defaultSort={settings.defaultSort}
              listDensity={settings.listDensity}
              setIsShareModalOpen={setIsShareModalOpen}
              setIsExportModalOpen={setIsExportModalOpen}
              onEditList={canEditList ? () => setIsEditListModalOpen(true) : null}
              updateItemMutation={updateItemMutation}
              deleteItemMutation={deleteItemMutation}
            />
          )}
        </div>

        {/* Input Area */}
        {activeTab === "chat" && (
          <ChatInput
            message={message}
            setMessage={setMessage}
            onSend={handleSendMessage}
            isPending={processInputMutation.isPending}
          />
        )}
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        activeList={activeList}
        activeListItems={activeListItems}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareEmail={shareEmail}
        setShareEmail={setShareEmail}
        sharePermission={sharePermission}
        setSharePermission={setSharePermission}
        onShare={handleShareList}
        isPending={shareListMutation.isPending}
      />

      <NewListModal
        isOpen={isNewListModalOpen}
        onClose={closeNewListModal}
        newListStep={newListStep}
        setNewListStep={setNewListStep}
        newListName={newListName}
        setNewListName={setNewListName}
        newListPurpose={newListPurpose}
        setNewListPurpose={setNewListPurpose}
        isAnalyzing={isAnalyzing}
        analyzedRules={analyzedRules}
        onAnalyze={analyzePurpose}
        onCreate={handleCreateList}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <EditListModal
        isOpen={isEditListModalOpen}
        onClose={() => setIsEditListModalOpen(false)}
        activeList={activeList}
        onSave={handleUpdateList}
        isSaving={updateListMutation.isPending}
      />
    </div>
  );
}
