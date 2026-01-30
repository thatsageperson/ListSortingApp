import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react-native';
import { useAuth } from '@/utils/auth/useAuth';
import { apiFetch } from '@/utils/api';
import { useListMutations } from '@/hooks/useListMutations';
import { useChatMutations } from '@/hooks/useChatMutations';
import { useNewListModal } from '@/hooks/useNewListModal';
import { DrawerSidebar } from '@/components/DrawerSidebar';
import { ChatWelcome } from '@/components/ChatWelcome';
import { ChatHistory } from '@/components/ChatHistory';
import { ChatInput } from '@/components/ChatInput';
import { ListView } from '@/components/ListView';
import { NewListModal } from '@/components/NewListModal';
import { SettingsScreen } from '@/components/SettingsScreen';

export default function Main() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    newListStep, setNewListStep,
    newListName, setNewListName,
    newListPurpose, setNewListPurpose,
    isAnalyzing, analyzedRules,
    analyzePurpose, resetModal,
  } = useNewListModal();

  const { data: lists = [], isLoading: isLoadingLists } = useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      const res = await apiFetch('/api/lists');
      if (!res.ok) throw new Error('Failed to fetch lists');
      return res.json();
    },
  });

  const { data: activeListItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['items', activeTab],
    queryFn: async () => {
      if (activeTab === 'chat') return [];
      const res = await apiFetch(`/api/lists/${activeTab}/items`);
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    },
    enabled: activeTab !== 'chat',
  });

  const { processInputMutation } = useChatMutations(setChatHistory, setMessage);
  const {
    createListMutation,
    deleteListMutation,
    updateItemMutation,
    deleteItemMutation,
  } = useListMutations(activeTab, setActiveTab);

  const handleSendMessage = useCallback(() => {
    if (message.trim()) {
      processInputMutation.mutate(message);
    }
  }, [message, processInputMutation]);

  const closeNewListModal = () => {
    setIsNewListModalOpen(false);
    resetModal();
  };

  const handleCreateList = () => {
    createListMutation.mutate(
      {
        name: newListName,
        description: analyzedRules.description,
        rules: analyzedRules.rules,
      },
      { onSuccess: closeNewListModal },
    );
  };

  const activeList = lists.find((l) => String(l.id) === activeTab);
  const headerTitle = showSettings ? 'Settings' : activeTab === 'chat' ? 'SmartLists' : activeList?.name || 'List';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.menuBtn}>
            <Menu size={24} color="#1E1E1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
          <View style={styles.menuBtn} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {showSettings ? (
            <SettingsScreen />
          ) : activeTab === 'chat' ? (
            chatHistory.length === 0 ? (
              <ChatWelcome />
            ) : (
              <ChatHistory
                chatHistory={chatHistory}
                isPending={processInputMutation.isPending}
              />
            )
          ) : (
            <ListView
              activeList={activeList}
              activeListItems={activeListItems}
              isLoadingItems={isLoadingItems}
              updateItemMutation={updateItemMutation}
              deleteItemMutation={deleteItemMutation}
            />
          )}
        </View>

        {/* Chat Input */}
        {!showSettings && activeTab === 'chat' && (
          <ChatInput
            message={message}
            setMessage={setMessage}
            onSend={handleSendMessage}
            isPending={processInputMutation.isPending}
          />
        )}
      </KeyboardAvoidingView>

      {/* Drawer */}
      <DrawerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => { setShowSettings(false); setActiveTab(tab); }}
        lists={lists}
        onNewList={() => setIsNewListModalOpen(true)}
        onDeleteList={(id) => deleteListMutation.mutate(id)}
        onSignOut={() => { signOut(); router.replace('/'); }}
        onHome={() => { setShowSettings(false); router.replace('/'); }}
        onSettings={() => setShowSettings(true)}
      />

      {/* New List Modal */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  menuBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E1E1E', flex: 1, textAlign: 'center' },
  content: { flex: 1 },
});
