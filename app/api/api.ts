// api.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Network from 'expo-network';

const ENV_API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
let cachedApiUrl: string = ENV_API_URL || (Platform.OS === 'android' && !Constants.isDevice ? 'http://10.0.2.2/api' : 'http://localhost/api');

console.log('[API] Initial fallback API URL:', cachedApiUrl);

/**
 * Detect the correct local API URL dynamically and update cachedApiUrl
 */
(async () => {
  try {
    if (ENV_API_URL && ENV_API_URL !== '') {
      // Env variable already set, nothing to do
      console.log('[API] Using environment variable:', ENV_API_URL);
      cachedApiUrl = ENV_API_URL;
    } else if (Platform.OS === 'android' && !Constants.isDevice) {
      // Android emulator special case
      cachedApiUrl = 'http://10.0.2.2/api';
      console.log('[API] Android emulator detected, using 10.0.2.2');
    } else {
      // Physical device or iOS simulator: detect local IP
      const ip = await Network.getIpAddressAsync();
      cachedApiUrl = `http://${ip}/api`;
      console.log('[API] Detected device IP, using API URL:', cachedApiUrl);
    }
  } catch (err) {
    cachedApiUrl = 'http://localhost/api';
    console.warn('[API] Failed to detect local IP, using fallback:', cachedApiUrl);
  }
})();

/**
 * API constant that components can use directly
 */
export const API: string = cachedApiUrl;

/**
 * Optional fetch wrapper
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Always use latest cachedApiUrl
  const url = `${cachedApiUrl}${endpoint}`;
  console.log('[API] Fetching URL:', url);

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    console.error('[API] Error:', message);
    throw new Error(`API Error: ${message}`);
  }

  const data = await response.json();
  console.log('[API] Response:', data);
  return data;
}
