import { loggerService } from './LoggerService';
import { storageService } from './StorageService';

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
    const existingData = storageService.getItem(this.STORAGE_KEY);
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
    const data = storageService.getJson(this.STORAGE_KEY, null);
    return data || { users: [], exams: [], submissions: [] };
  }

  saveData(data) {
    storageService.setJson(this.STORAGE_KEY, data);
  }

  // --- TEACHER & AUTH METHODS ---
  loginUser(email, passwordHash) {
    const data = this.getData();
    const user = data.users.find(u => u.email === email && u.passwordHash === passwordHash);
    loggerService.info(user ? 'User logged in' : 'Failed login attempt', { email });
    return user || null;
  }

  registerUser({ name, role, email, passwordHash }) {
    const data = this.getData();
    const emailExists = data.users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      throw new Error('A user with this email already exists.');
    }

    const user = {
      id: `u_${Date.now()}`,
      name,
      role,
      email,
      passwordHash,
    };

    data.users.push(user);
    this.saveData(data);
    loggerService.info('User registered', { id: user.id, role: user.role });
    return user;
  }

  getExamsByTeacher(teacherId) {
    const data = this.getData();
    return data.exams.filter(exam => exam.teacherId === teacherId);
  }

  createExam(exam) {
    const data = this.getData();
    data.exams.push(exam);
    this.saveData(data);
    loggerService.info('Exam created', { id: exam.id, status: exam.status });
  }

  updateExam(examId, updates) {
    const data = this.getData();
    const examIndex = data.exams.findIndex(exam => exam.id === examId);

    if (examIndex === -1) return null;

    data.exams[examIndex] = {
      ...data.exams[examIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveData(data);
    loggerService.info('Exam updated', { id: examId });
    return data.exams[examIndex];
  }

  updateExamStatus(examId, status) {
    return this.updateExam(examId, { status });
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
    const storedSubmission = {
      ...submission,
      id: submission.id || `sub_${Date.now()}`,
    };
    data.submissions.push(storedSubmission);
    this.saveData(data);
    loggerService.info('Exam submitted', { examId: storedSubmission.examId, studentId: storedSubmission.studentId });
  }

  // --- NEW: GRADING METHODS ---
  getSubmissionsForExam(examId) {
    const data = this.getData();
    return data.submissions.filter(sub => sub.examId === examId);
  }

  getSubmissionsByStudent(studentId) {
    const data = this.getData();
    return data.submissions.filter(sub => sub.studentId === studentId);
  }

  updateSubmissionGrade(submissionId, newGrade) {
    const data = this.getData();
    const subIndex = data.submissions.findIndex(s => s.id === submissionId);
    if (subIndex !== -1) {
      data.submissions[subIndex].finalGrade = newGrade;
      data.submissions[subIndex].status = 'GRADED';
      this.saveData(data);
      loggerService.info('Submission graded', { submissionId, newGrade });
    }
  }
}

export const mockDB = MockDBService.getInstance();
