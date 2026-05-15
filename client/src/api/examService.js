
import { mockDb } from './mockDb';

const DELAY = 500;

export const getAllExams = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockDb.exams]);
    }, DELAY);
  });
};

export const getExamById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exam = mockDb.exams.find(e => e.id === id);
      if (exam) {
        resolve({ ...exam });
      } else {
        reject(new Error("Exam not found"));
      }
    }, DELAY);
  });
};

export const createExam = (exam) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newExam = { ...exam, id: `exam-${Date.now()}` };
      mockDb.exams.push(newExam);
      resolve(newExam);
    }, DELAY);
  });
};

export const getStudentScores = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockDb.studentScores]);
    }, DELAY);
  });
};
