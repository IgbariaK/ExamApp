class StorageService {
  getItem(key) {
    return localStorage.getItem(key);
  }

  setItem(key, value) {
    localStorage.setItem(key, value);
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }

  getJson(key, fallback = null) {
    const value = this.getItem(key);
    if (!value) return fallback;

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  setJson(key, value) {
    this.setItem(key, JSON.stringify(value));
  }
}

export const storageService = new StorageService();
