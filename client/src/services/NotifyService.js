class NotifyService {
  success(message) {
    window.alert(message);
  }

  error(message) {
    window.alert(message);
  }
}

export const notifyService = new NotifyService();
