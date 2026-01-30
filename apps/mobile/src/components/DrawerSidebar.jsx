import { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { X, Plus, MessageSquare, List, Home, LogOut, Trash2, Settings } from 'lucide-react-native';

const DRAWER_WIDTH = 280;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function DrawerSidebar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  lists,
  onNewList,
  onDeleteList,
  onSignOut,
  onHome,
  onSettings,
}) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const nav = (tab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <Pressable style={styles.overlay} onPress={onClose} />
      )}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View style={styles.header}>
          <Text style={styles.brand}>SmartLists</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={22} color="#70757F" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.newBtn} onPress={() => { onNewList(); onClose(); }} activeOpacity={0.7}>
          <Plus size={18} color="#fff" />
          <Text style={styles.newBtnText}>New List</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.navItem, activeTab === 'chat' && styles.navItemActive]}
            onPress={() => nav('chat')}
          >
            <MessageSquare size={18} color={activeTab === 'chat' ? '#1E1E1E' : '#A8ADB4'} />
            <Text style={[styles.navText, activeTab === 'chat' && styles.navTextActive]}>
              Add Items
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>MY LISTS</Text>
          {lists.map((list) => (
            <View key={list.id} style={styles.listRow}>
              <TouchableOpacity
                style={[styles.navItem, styles.listNavItem, activeTab === String(list.id) && styles.navItemActive]}
                onPress={() => nav(String(list.id))}
              >
                <List size={18} color={activeTab === String(list.id) ? '#1E1E1E' : '#A8ADB4'} />
                <Text
                  style={[styles.navText, activeTab === String(list.id) && styles.navTextActive]}
                  numberOfLines={1}
                >
                  {list.name}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDeleteList(list.id)}
              >
                <Trash2 size={14} color="#70757F" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerItem} onPress={() => { onHome(); onClose(); }}>
            <Home size={18} color="#A8ADB4" />
            <Text style={styles.footerText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem} onPress={() => { onSettings(); onClose(); }}>
            <Settings size={18} color="#A8ADB4" />
            <Text style={styles.footerText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerItem} onPress={() => { onSignOut(); onClose(); }}>
            <LogOut size={18} color="#A8ADB4" />
            <Text style={styles.footerText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 40,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    zIndex: 50,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brand: { fontSize: 22, fontWeight: '800', color: '#1E1E1E' },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#219079',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 20,
  },
  newBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  scroll: { flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 10,
  },
  navItemActive: { backgroundColor: '#F1F1F1' },
  listNavItem: { flex: 1 },
  navText: { fontSize: 14, color: '#70757F' },
  navTextActive: { color: '#1E1E1E', fontWeight: '700' },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A8ADB4',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  listRow: { flexDirection: 'row', alignItems: 'center' },
  deleteBtn: { padding: 8 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingTop: 12,
    paddingBottom: 20,
    gap: 4,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  footerText: { fontSize: 14, color: '#70757F' },
});
