import { View, Text, StyleSheet } from 'react-native';
import { BrainCircuit } from 'lucide-react-native';

export function ChatWelcome() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <BrainCircuit size={32} color="#219079" />
      </View>
      <Text style={styles.title}>What can I organize for you?</Text>
      <Text style={styles.subtitle}>
        Type in tasks, groceries, ideas, or anything else. I'll automatically sort them into your
        lists.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 16 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(33,144,121,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1E1E1E', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#70757F', textAlign: 'center', marginBottom: 24, maxWidth: 300 },
});
