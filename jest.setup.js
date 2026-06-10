/** In-memory stand-in — the native NitroModules backing MMKV doesn't exist in Jest. */
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const entries = new Map();
    return {
      set: (key, value) => entries.set(key, String(value)),
      getString: (key) => entries.get(key),
      remove: (key) => entries.delete(key),
      contains: (key) => entries.has(key),
      clearAll: () => entries.clear(),
    };
  },
}));
