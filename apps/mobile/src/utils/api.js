import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDefaultUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:4000';
  }

  // In Expo Go, hostUri includes the LAN IP (e.g., 192.168.1.10:19000).
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  const host = hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:4000`;
  }

  // Fallback for simulators or when hostUri is unavailable.
  return 'http://localhost:4000';
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || getDefaultUrl();

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}
