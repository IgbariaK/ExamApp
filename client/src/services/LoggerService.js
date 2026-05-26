import { storageService } from './StorageService';

class LoggerService {
  info(message, data = null) {
    this.write('info', message, data);
  }

  error(message, data = null) {
    this.write('error', message, data);
  }

  write(level, message, data) {
    const entry = {
      id: `log_${Date.now()}`,
      level,
      message,
      data,
      createdAt: new Date().toISOString(),
    };

    const logs = storageService.getJson('examApp_logs', []);
    logs.push(entry);
    storageService.setJson('examApp_logs', logs.slice(-100));
  }
}

export const loggerService = new LoggerService();
