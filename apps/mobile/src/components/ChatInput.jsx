import { useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Navigation, Mic, Square, X } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useVoiceInput } from '../hooks/useVoiceInput';

export function ChatInput({ message, setMessage, onSend, isPending }) {
  const preVoiceMessageRef = useRef('');

  const onTranscript = useCallback(
    (text) => {
      const prefix = preVoiceMessageRef.current;
      setMessage(prefix ? `${prefix} ${text}` : text);
    },
    [setMessage],
  );

  const {
    isListening,
    isSupported,
    error,
    startListening: rawStart,
    stopListening,
    cancelListening,
    isTranscribing,
  } = useVoiceInput({ onTranscript });

  const startListening = useCallback(() => {
    preVoiceMessageRef.current = message;
    rawStart();
  }, [message, rawStart]);

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={isListening ? 'Listening...' : 'Milk, eggs, finish report, call Sarah...'}
          placeholderTextColor="#9CA3AF"
          multiline
          editable={!isPending && !isListening}
          onSubmitEditing={onSend}
          blurOnSubmit
        />

        {/* Voice input button */}
        {isSupported && (
          <View style={styles.micContainer}>
            {/* Pulsing ring animation while listening */}
            <AnimatePresence>
              {isListening && (
                <MotiView
                  from={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: 'timing',
                    duration: 1200,
                    loop: true,
                  }}
                  style={styles.pulseRing}
                />
              )}
            </AnimatePresence>

            <TouchableOpacity
              style={[
                styles.micBtn,
                isListening && styles.micBtnActive,
                isPending && styles.sendBtnDisabled,
              ]}
              onPress={isListening ? stopListening : startListening}
              disabled={isPending || isTranscribing}
              activeOpacity={0.7}
            >
              {isTranscribing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : isListening ? (
                <Square size={18} color="#fff" fill="#fff" />
              ) : (
                <Mic size={20} color="#fff" />
              )}
            </TouchableOpacity>

            {/* Cancel button while listening */}
            {isListening && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={cancelListening}
                activeOpacity={0.7}
              >
                <X size={10} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Send button */}
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

      {/* Error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: '#FFFBEB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 10,
    maxHeight: 100,
  },
  micContainer: {
    position: 'relative',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#0F766E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
  },
  pulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#EF4444',
  },
  cancelBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.5 },
  errorText: {
    fontSize: 11,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
});
