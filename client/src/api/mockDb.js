
export const mockDb = {
  exams: [
    {
      id: "exam-1",
      title: "Introduction to React",
      questions: [
        { id: 1, text: "What is JSX?", options: ["A CSS framework", "A JavaScript syntax extension", "A database"], correct: 1 },
        { id: 2, text: "What is a component?", options: ["A reusable UI piece", "A backend server", "A styling tool"], correct: 0 }
      ]
    },
    {
      id: "exam-2",
      title: "Advanced JavaScript",
      questions: [
        { id: 1, text: "What is a Closure?", options: ["A way to close a tab", "A function with its lexical environment", "A type of loop"], correct: 1 }
      ]
    }
  ],
  studentScores: [
    { studentId: "s1", examId: "exam-1", score: 85 },
    { studentId: "s2", examId: "exam-1", score: 92 }
  ]
};
