import { AsyncStorage } from "@tanstack/react-query-persist-client";
import { Preferences } from "@capacitor/preferences";

export class CapacitorAsyncStorage implements AsyncStorage<string> {
  async getItem(key: string) {
    const value = await Preferences.get({ key });
    return value.value;
  }

  async removeItem(key: string) {
    await Preferences.remove({ key });
  }

  async setItem(key: string, value: string) {
    await Preferences.set({ key, value });
  }
}
