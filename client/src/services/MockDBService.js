class MockDBService {
  static instance = null;
  STORAGE_KEY = 'examApp_mockDB';

  constructor() {
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

  getData() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // --- TEACHER & AUTH METHODS ---
  loginUser(email, passwordHash) {
    const data = this.getData();
    const user = data.users.find(u => u.email === email && u.passwordHash === passwordHash);
    return user || null;
  }

  getExamsByTeacher(teacherId) {
    const data = this.getData();
    return data.exams.filter(exam => exam.teacherId === teacherId);
  }

  createExam(exam) {
    const data = this.getData();
    data.exams.push(exam);
    this.saveData(data);
  }

  // --- STUDENT METHODS ---
  getAllActiveExams() {
    const data = this.getData();
    return data.exams.filter(exam => exam.status === 'ACTIVE');
  }

  getExamById(examId) {
    const data = this.getData();
    return data.exams.find(exam => exam.id === examId) || null;
  }

  submitExam(submission) {
    const data = this.getData();
    data.submissions.push(submission);
    this.saveData(data);
  }

  // --- NEW: GRADING METHODS ---
  getSubmissionsForExam(examId) {
    const data = this.getData();
    return data.submissions.filter(sub => sub.examId === examId);
  }

  updateSubmissionGrade(submissionId, newGrade) {
    const data = this.getData();
    const subIndex = data.submissions.findIndex(s => s.id === submissionId);
    if (subIndex !== -1) {
      data.submissions[subIndex].finalGrade = newGrade;
      data.submissions[subIndex].status = 'GRADED';
      this.saveData(data);
    }
  }
}

export const mockDB = MockDBService.getInstance();