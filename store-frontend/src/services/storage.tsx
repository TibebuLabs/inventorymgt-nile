class SharedPreferencesService {
  private static instance: SharedPreferencesService | null = null;

  private constructor() {}

  static getInstance(): SharedPreferencesService {
    if (!SharedPreferencesService.instance) {
      SharedPreferencesService.instance = new SharedPreferencesService();
    }
    return SharedPreferencesService.instance;
  }

  getString(key: string): string | null {
    return localStorage.getItem(key);
  }

  async setString(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

export default SharedPreferencesService;
