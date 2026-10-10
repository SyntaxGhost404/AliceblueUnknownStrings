import AsyncStorage from '@react-native-async-storage/async-storage';

// Namespaced persistence helpers (same contract as the reference build's storage module).
const PREFIX = '@aliceblue:';

export async function storeItem(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.log('AsyncStorage setItem ' + PREFIX + key, e);
  }
}

export async function retrieveItem<T = string>(key: string, parse = false): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (raw == null) return null;
    return (parse ? JSON.parse(raw) : raw) as T;
  } catch (e) {
    console.log('AsyncStorage getItem ' + PREFIX + key, e);
    return null;
  }
}

export async function deleteItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch (e) {
    console.log('AsyncStorage removeItem ' + PREFIX + key, e);
  }
}
