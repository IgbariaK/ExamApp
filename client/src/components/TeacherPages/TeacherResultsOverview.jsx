import { Navigate, useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { storageService } from '../../services/StorageService';

const TeacherResultsOverview = () => {
  const navigate = useNavigate();
  const user = storageService.getJson('activeUser', null);
  const exams = user?.role === 'TEACHER' ? mockDB.getExamsByTeacher(user.id) : [];

  if (!user || user.role !== 'TEACHER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Exam Results</h2>

      {exams.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px dashed #ccc' }}>
          <h3>No exams yet!</h3>
          <p style={{ color: '#666' }}>Create an exam before reviewing results.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {exams.map((exam) => {
            const submissions = mockDB.getSubmissionsForExam(exam.id);
            const gradedCount = submissions.filter(submission => submission.status === 'GRADED').length;
            const pendingCount = submissions.length - gradedCount;

            return (
              <div key={exam.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px', color: '#2c3e50' }}>{exam.title}</h3>
                  <span style={{ color: '#666' }}>
                    Submissions: <strong>{submissions.length}</strong> | Graded: <strong>{gradedCount}</strong> | Pending: <strong>{pendingCount}</strong>
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/results/${exam.id}`)}
                  style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                >
                  View Results
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherResultsOverview;
