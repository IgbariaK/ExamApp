import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { storageService } from '../../services/StorageService';

const StudentDashboard = () => {
  const [user] = useState(() => storageService.getJson('activeUser', null));
  const [availableExams] = useState(() => mockDB.getAllActiveExams());
  const [attemptCounts] = useState(() => {
    const storedUser = storageService.getJson('activeUser', null);
    if (!storedUser || storedUser.role !== 'STUDENT') return new Map();
    return mockDB.getSubmissionsByStudent(storedUser.id).reduce((counts, submission) => {
      counts.set(submission.examId, (counts.get(submission.examId) || 0) + 1);
      return counts;
    }, new Map());
  });
  const navigate = useNavigate();

  if (!user || user.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Available Exams</h2>

      {availableExams.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px dashed #ccc' }}>
          <h3>No exams available right now.</h3>
          <p style={{ color: '#666' }}>Check back later or contact your teacher.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {availableExams.map(exam => {
            const attemptsUsed = attemptCounts.get(exam.id) || 0;
            const maxAttempts = Number(exam.maxAttempts ?? 1);
            const attemptsExhausted = attemptsUsed >= maxAttempts;

            return (
              <div key={exam.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{exam.title}</h3>
                  <span style={{ fontSize: '0.9em', color: '#7f8c8d' }}>
                    Passing Grade: {exam.passingGrade} | Questions: {exam.questions.length} | Attempts: {attemptsUsed}/{maxAttempts}
                  </span>
                </div>
                {attemptsExhausted ? (
                  <span style={{ padding: '10px 20px', backgroundColor: '#ecf0f1', color: '#7f8c8d', borderRadius: '4px', fontWeight: 'bold' }}>
                    Attempts Used
                  </span>
                ) : (
                  <button
                    onClick={() => navigate(`/take-exam/${exam.id}`)}
                    style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                  >
                    Take Exam
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
