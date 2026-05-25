class MockDBService {
  static instance = null;
  STORAGE_KEY = 'examApp_mockDB';

  constructor() {
    // Singleton pattern: Ensure only one instance is ever created
    if (MockDBService.instance) {
      return MockDBService.instance;
    }
    MockDBService.instance = this;
    this.initializeDB();
  }

  static getInstance() {
    if (!MockDBService.instance) {
      MockDBService.instance = new MockDBService();
    }
    return MockDBService.instance;
  }

  // אתחול מסד הנתונים עם משתמשי דיפולט אם הוא ריק
  initializeDB() {
    const existingData = localStorage.getItem(this.STORAGE_KEY);
    if (!existingData) {
      const initialData = {
        users: [
          { id: 'u1', name: 'Dr. Smith', role: 'TEACHER', email: 'smith@test.com', passwordHash: '1234' },
          { id: 'u2', name: 'John Doe', role: 'STUDENT', email: 'john@test.com', passwordHash: '1234' }
        ],
        exams: [],
        submissions: []
      };
      this.saveData(initialData);
    }
  }

  // קריאת נתונים מ-LocalStorage
  getData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  // שמירת נתונים ל-LocalStorage
  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // --- PUBLIC METHODS (API) ---

  // אימות משתמש (Login)
  loginUser(email, passwordHash) {
    const data = this.getData();
    const user = data.users.find(u => u.email === email && u.passwordHash === passwordHash);
    return user || null;
  }

  // שליפת מבחנים לפי מזהה מרצה
  getExamsByTeacher(teacherId) {
    const data = this.getData();
    return data.exams.filter(exam => exam.teacherId === teacherId);
  }

  // יצירת מבחן חדש
  createExam(exam) {
    const data = this.getData();
    data.exams.push(exam);
    this.saveData(data);
  }
}

// Export the singleton instance to be used across the app
export const mockDB = MockDBService.getInstance();