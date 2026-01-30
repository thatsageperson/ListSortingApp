import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, ChevronRight } from 'lucide-react-native';

export function NewListModal({
  isOpen,
  onClose,
  newListStep,
  setNewListStep,
  newListName,
  setNewListName,
  newListPurpose,
  setNewListPurpose,
  isAnalyzing,
  analyzedRules,
  onAnalyze,
  onCreate,
}) {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Create New List</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#70757F" />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled">
            {newListStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.label}>List Name</Text>
                <TextInput
                  style={styles.input}
                  value={newListName}
                  onChangeText={setNewListName}
                  placeholder="e.g. Travel Bucket List"
                  placeholderTextColor="#B4B4B4"
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, !newListName.trim() && styles.btnDisabled]}
                  disabled={!newListName.trim()}
                  onPress={() => setNewListStep(2)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.primaryBtnText}>Next</Text>
                  <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {newListStep === 2 && (
              <View style={styles.stepContent}>
                <View style={styles.hint}>
                  <Text style={styles.hintText}>
                    Tell me what should go in <Text style={{ fontWeight: '700' }}>{newListName}</Text>.
                    I'll learn to recognize relevant items for you.
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={newListPurpose}
                  onChangeText={setNewListPurpose}
                  placeholder="e.g. This list is for places I want to visit..."
                  placeholderTextColor="#B4B4B4"
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[styles.primaryBtn, (!newListPurpose.trim() || isAnalyzing) && styles.btnDisabled]}
                  disabled={!newListPurpose.trim() || isAnalyzing}
                  onPress={onAnalyze}
                  activeOpacity={0.7}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Finalize List</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {newListStep === 3 && analyzedRules && (
              <View style={styles.stepContent}>
                <Text style={styles.smallLabel}>AI UNDERSTANDING</Text>
                <Text style={styles.ruleDesc}>{analyzedRules.description}</Text>
                <View style={styles.rulesBox}>
                  <Text style={styles.smallLabel}>MATCHING LOGIC</Text>
                  <Text style={styles.rulesText}>"{analyzedRules.rules}"</Text>
                </View>
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => setNewListStep(2)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.secondaryBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.createBtn} onPress={onCreate} activeOpacity={0.7}>
                    <Text style={styles.primaryBtnText}>Create List</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E1E1E' },
  stepContent: { gap: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#70757F' },
  input: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E1E1E',
  },
  textarea: { minHeight: 100 },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: '#219079',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: {
    backgroundColor: 'rgba(33,144,121,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(33,144,121,0.2)',
    borderRadius: 16,
    padding: 14,
  },
  hintText: { fontSize: 13, color: '#219079' },
  smallLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A8ADB4',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ruleDesc: { fontSize: 14, color: '#1E1E1E', marginTop: 4 },
  rulesBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  rulesText: { fontSize: 12, color: '#70757F', fontStyle: 'italic' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F1F1F1',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: '#1E1E1E' },
  createBtn: {
    flex: 2,
    backgroundColor: '#219079',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
});
