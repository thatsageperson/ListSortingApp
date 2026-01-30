import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Navigation } from 'lucide-react-native';

export function ChatInput({ message, setMessage, onSend, isPending }) {
  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Milk, eggs, finish report, call Sarah..."
          placeholderTextColor="#B4B4B4"
          multiline
          editable={!isPending}
          onSubmitEditing={onSend}
          blurOnSubmit
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!message.trim() || isPending) && styles.sendBtnDisabled]}
          onPress={onSend}
          disabled={!message.trim() || isPending}
          activeOpacity={0.7}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Navigation size={20} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: '#F9F9F9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E1E1E',
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#219079',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
});
