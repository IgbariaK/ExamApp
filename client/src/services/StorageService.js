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

  resetForVersion(version) {
    const versionKey = 'examApp_storageVersion';
    if (this.getItem(versionKey) === version) return;

    localStorage.clear();
    this.setItem(versionKey, version);
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

  getActiveUser() {
    const user = this.getJson('activeUser', null);
    if (!user) return null;

    if (user.token && this.isTokenExpired(user.token)) {
      this.removeItem('activeUser');
      return null;
    }

    return user;
  }

  isTokenExpired(token) {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return true;

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return !payload.exp || payload.exp <= Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  setJson(key, value) {
    this.setItem(key, JSON.stringify(value));
  }
}

export const storageService = new StorageService();
