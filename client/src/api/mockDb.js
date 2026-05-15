// client/src/api/mockDb.js

export const mockDb = {
  exams: [
    {
      id: 1,
      title: "Introduction to React",
      questions: [
        { id: 101, text: "What is a component?", answer: "A reusable piece of UI." },
        { id: 102, text: "What hook manages state?", answer: "useState" }
      ]
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      questions: [
        { id: 201, text: "What is a closure?", answer: "A function bundled with its lexical environment." }
      ]
    }
  ],
  studentScores: [
    { studentId: "S001", examId: 1, score: 95 },
    { studentId: "S002", examId: 1, score: 88 }
  ]
};