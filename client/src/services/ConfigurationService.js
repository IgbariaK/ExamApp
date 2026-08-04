class ConfigurationService {
  settings = {
    appName: 'ExamApp',
    dataSource: import.meta.env.VITE_DATA_SOURCE || (import.meta.env.PROD ? 'server' : 'client'),
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    defaultPassingGrade: 60,
    examStatuses: ['DRAFT', 'ACTIVE', 'GRADING', 'COMPLETED'],
    roles: ['TEACHER', 'STUDENT'],
  };

  get(key) {
    return this.settings[key];
  }
}

export const configurationService = new ConfigurationService();
