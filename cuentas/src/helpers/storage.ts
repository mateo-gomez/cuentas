import AsyncStorage from "@react-native-async-storage/async-storage";

export const storage = {
  setItem: async (key: string, value: string) => {
    AsyncStorage.setItem(key, value);
  },
  getItem: async (key: string) => {
    return AsyncStorage.getItem(key);
  },
  removeItem: async (key: string) => {
    AsyncStorage.removeItem(key);
  },
};
