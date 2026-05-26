class ConfigurationService {
  settings = {
    appName: 'ExamApp',
    defaultPassingGrade: 60,
    examStatuses: ['DRAFT', 'ACTIVE', 'GRADING', 'COMPLETED'],
    roles: ['TEACHER', 'STUDENT'],
  };

  get(key) {
    return this.settings[key];
  }
}

export const configurationService = new ConfigurationService();
