export const createInitialData = () => ({
  users: [
    { id: 'u1', name: 'Dr. Smith', role: 'TEACHER', email: 'smith@test.com', passwordHash: '1234' },
    { id: 'u2', name: 'John Doe', role: 'STUDENT', email: 'john@test.com', passwordHash: '1234' },
  ],
  exams: [],
  submissions: [],
});
