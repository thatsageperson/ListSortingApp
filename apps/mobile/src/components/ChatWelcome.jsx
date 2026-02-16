import { View, Text, StyleSheet, Image } from 'react-native';

const APP_ICON_URI =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_BASE_URL
    ? process.env.EXPO_PUBLIC_BASE_URL.replace(/\/$/, '')
    : '') + '/jot-app-icon.svg';

export function ChatWelcome() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Image
          source={{ uri: APP_ICON_URI }}
          style={styles.appIcon}
          resizeMode="contain"
          accessibilityLabel="jot. logo"
        />
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  appIcon: {
    width: 64,
    height: 64,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, maxWidth: 300 },
});
