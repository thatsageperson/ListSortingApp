import { useRef, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';

export function ChatHistory({ chatHistory, isPending }) {
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && chatHistory.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatHistory.length, isPending]);

  const data = isPending
    ? [...chatHistory, { role: 'loading', content: '' }]
    : chatHistory;

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      keyExtractor={(_, i) => String(i)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        if (item.role === 'loading') {
          return (
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color="#219079" />
            </View>
          );
        }
        const isUser = item.role === 'user';
        return (
          <View style={[styles.row, isUser && styles.rowUser]}>
            <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.text, isUser && styles.userText]}>{item.content}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 16, paddingHorizontal: 16, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', padding: 14, borderRadius: 20 },
  userBubble: {
    backgroundColor: '#219079',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  text: { fontSize: 15, lineHeight: 22, color: '#1E1E1E' },
  userText: { color: '#fff' },
});
