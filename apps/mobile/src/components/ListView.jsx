import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { ListItem } from './ListItem';

export function ListView({ activeList, activeListItems, isLoadingItems, updateItemMutation, deleteItemMutation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{activeList?.name}</Text>
        {activeList?.description ? <Text style={styles.desc}>{activeList.description}</Text> : null}
      </View>

      {isLoadingItems ? (
        <ActivityIndicator size="large" color="#219079" style={{ marginTop: 40 }} />
      ) : activeListItems.length > 0 ? (
        <FlatList
          data={activeListItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              onUpdate={(fields) => updateItemMutation.mutate(fields)}
              onDelete={(itemId) => deleteItemMutation.mutate(itemId)}
            />
          )}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>This list is empty. Add items in the chat!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#1E1E1E' },
  desc: { fontSize: 13, color: '#70757F', marginTop: 4 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  empty: {
    marginTop: 40,
    marginHorizontal: 16,
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#EDEDED',
    alignItems: 'center',
  },
  emptyText: { color: '#70757F', fontSize: 14 },
});
