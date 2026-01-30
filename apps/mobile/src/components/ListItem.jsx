import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Check, Trash2, Clock, Circle, MoreVertical } from 'lucide-react-native';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

const DISPLAY_MODES = [
  { value: 'todo-strike', label: 'Task (Strikethrough)' },
  { value: 'todo-no-strike', label: 'Task (No Strikethrough)' },
  { value: 'bullet', label: 'Bullet Point' },
  { value: 'log-clock', label: 'Log (Clock)' },
];

const getPriorityStyle = (priority) => {
  if (priority === 'high') return { color: '#EF4444', bg: '#FEF2F2' };
  if (priority === 'medium') return { color: '#F97316', bg: '#FFF7ED' };
  if (priority === 'low') return { color: '#3B82F6', bg: '#EFF6FF' };
  return null;
};

const formatTimestamp = (date) => {
  const d = new Date(date);
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
  if (isYesterday(d)) return 'Yesterday at ' + format(d, 'h:mm a');
  return format(d, 'MMM d, yyyy');
};

export function ListItem({ item, onUpdate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mode = item.display_mode || (item.type === 'log' ? 'log-clock' : 'todo-strike');
  const showCheckbox = mode === 'todo-strike' || mode === 'todo-no-strike';
  const isStrikethrough = mode === 'todo-strike' && item.completed;
  const priority = getPriorityStyle(item.priority);

  const renderIcon = () => {
    if (mode === 'log-clock') return <Clock size={16} color="#219079" />;
    if (mode === 'bullet') return <Circle size={8} color="#70757F" fill="#70757F" />;
    return (
      <TouchableOpacity
        onPress={() => onUpdate({ itemId: item.id, completed: !item.completed })}
        style={[styles.checkbox, item.completed && styles.checkboxChecked]}
      >
        {item.completed && <Check size={14} color="#fff" />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconCol}>{renderIcon()}</View>
      <View style={styles.content}>
        <Text style={[styles.text, isStrikethrough && styles.strikethrough]}>{item.content}</Text>
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
        <View style={styles.meta}>
          {priority && (
            <View style={[styles.badge, { backgroundColor: priority.bg }]}>
              <Text style={[styles.badgeText, { color: priority.color }]}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          )}
          {item.created_at && <Text style={styles.timestamp}>{formatTimestamp(item.created_at)}</Text>}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.actionBtn}>
          <MoreVertical size={16} color="#70757F" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionBtn}>
          <Trash2 size={16} color="#70757F" />
        </TouchableOpacity>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitle}>Display Mode</Text>
            {DISPLAY_MODES.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.menuItem}
                onPress={() => {
                  onUpdate({ itemId: item.id, display_mode: opt.value });
                  setMenuOpen(false);
                }}
              >
                <Text style={[styles.menuItemText, mode === opt.value && styles.menuItemActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginBottom: 10,
  },
  iconCol: { width: 28, alignItems: 'center', marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#219079', borderColor: '#219079' },
  content: { flex: 1, marginLeft: 8 },
  text: { fontSize: 15, color: '#1E1E1E' },
  strikethrough: { textDecorationLine: 'line-through', opacity: 0.5 },
  notes: { fontSize: 13, color: '#70757F', marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  timestamp: { fontSize: 11, color: '#70757F' },
  actions: { flexDirection: 'row', gap: 4, marginLeft: 8 },
  actionBtn: { padding: 4 },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 240,
  },
  menuTitle: { fontSize: 12, fontWeight: '700', color: '#A8ADB4', marginBottom: 8, textTransform: 'uppercase' },
  menuItem: { paddingVertical: 10 },
  menuItemText: { fontSize: 14, color: '#1E1E1E' },
  menuItemActive: { color: '#219079', fontWeight: '600' },
});
