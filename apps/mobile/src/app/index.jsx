import { useAuth } from '@/utils/auth/useAuth';
import useAuthModal from '@/utils/auth/useAuthModal';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Home screen: shows sign-in/sign-up when unauthenticated, or a Continue button when signed in.
 */
export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { open } = useAuthModal();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>List Organizer</Text>
        <Text style={styles.subtitle}>
          {isAuthenticated
            ? "You're signed in."
            : 'Sign in or create an account to get started.'}
        </Text>
        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/main')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => open({ mode: 'signin' })}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => open({ mode: 'signup' })}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTextSecondary}>Sign up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});
