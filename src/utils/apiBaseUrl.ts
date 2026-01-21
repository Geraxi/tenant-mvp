import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl;

  if (Platform.OS !== 'web') {
    const manifest = Constants.manifest as { debuggerHost?: string } | undefined;
    const manifest2 = (Constants as { manifest2?: { debuggerHost?: string } }).manifest2;
    const hostUri =
      Constants.expoConfig?.hostUri || manifest?.debuggerHost || manifest2?.debuggerHost;
    const host = hostUri ? hostUri.split(':')[0] : null;
    if (host) {
      return `http://${host}:5050`;
    }

    const isDevice = Constants.isDevice ?? false;
    if (!isDevice && Platform.OS === 'android') {
      return 'http://10.0.2.2:5050';
    }
    return 'http://127.0.0.1:5050';
  }

  return '';
}
