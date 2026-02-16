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
      <Text style={styles.title}>What do you need to jot down?</Text>
      <Text style={styles.subtitle}>
        To get started, open the menu and create at least one list,{'\n'}it's where all your jots will land.
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
  title: { fontSize: 30, fontWeight: '200', fontStyle: 'italic', color: '#1F2937', textAlign: 'center', marginBottom: 8, fontFamily: 'Lora', letterSpacing: 1.2 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, maxWidth: 300 },
});
