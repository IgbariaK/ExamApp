// 1. User Entity (Handles both Teachers and Students)
interface User {
  id: string;
  name: string;
  role: 'TEACHER' | 'STUDENT';
  email: string;
  passwordHash: string; 
}

// 2. Exam Entity (Created by Teacher)
interface Exam {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'GRADING' | 'COMPLETED';
  passingGrade: number;
  questions: Question[];
  createdAt: Date;
}

// 3. Question Entity (Part of an Exam)
interface Question {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_ENDED';
  text: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

// 4. Submission Entity (Generated when a Student takes an exam)
interface Submission {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, string>;
  finalGrade: number | null;
  status: 'SUBMITTED' | 'GRADED';
  submittedAt: Date;
}
