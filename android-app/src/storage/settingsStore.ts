import { DEFAULT_SETTINGS, UserSettings } from '../types/settings';
import { WhatsAppCleanerNativeBridge } from '../native/WhatsAppCleanerNative';

const SETTINGS_KEY = 'user_settings_v1';

export class SettingsStore {
  private static cachedSettings: UserSettings = DEFAULT_SETTINGS;

  static async loadSettings(): Promise<UserSettings> {
    const data = await WhatsAppCleanerNativeBridge.loadData<UserSettings>(SETTINGS_KEY);
    if (data) {
      this.cachedSettings = { ...DEFAULT_SETTINGS, ...data };
    }
    return this.cachedSettings;
  }

  static async saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const updated = { ...this.cachedSettings, ...settings };
    this.cachedSettings = updated;
    await WhatsAppCleanerNativeBridge.saveData(SETTINGS_KEY, updated);
    return updated;
  }

  static getCachedSettings(): UserSettings {
    return this.cachedSettings;
  }
}
