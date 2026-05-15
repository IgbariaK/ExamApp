// client/src/api/examService.js
import { mockDb } from './mockDb';

// Helper function to simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllExams = async () => {
  await delay();
  return [...mockDb.exams]; // Return a copy to simulate fetching
};

export const getExamById = async (id) => {
  await delay();
  const exam = mockDb.exams.find(e => e.id === Number(id));
  if (!exam) throw new Error("Exam not found");
  return exam;
};

export const createExam = async (exam) => {
  await delay();
  const newExam = {
    ...exam,
    id: Date.now(), // Generate a simple unique ID
    questions: exam.questions || []
  };
  mockDb.exams.push(newExam);
  return newExam;
};