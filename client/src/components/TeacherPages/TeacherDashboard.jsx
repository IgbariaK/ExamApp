import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { configurationService } from '../../services/ConfigurationService';
import { storageService } from '../../services/StorageService';

const TeacherDashboard = () => {
  const [user] = useState(() => storageService.getJson('activeUser', null));
  const [exams, setExams] = useState(() => {
    const storedUser = storageService.getJson('activeUser', null);
    return storedUser?.role === 'TEACHER' ? mockDB.getExamsByTeacher(storedUser.id) : [];
  });
  const navigate = useNavigate();
  const statuses = configurationService.get('examStatuses');

  const handleStatusChange = (examId, status) => {
    mockDB.updateExamStatus(examId, status);
    setExams(mockDB.getExamsByTeacher(user.id));
  };

  if (!user || user.role !== 'TEACHER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>My Exams</h2>
        <button
          onClick={() => navigate('/editor')}
          style={{ padding: '10px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Create New Exam
        </button>
      </div>

      {exams.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px dashed #ccc' }}>
          <h3>No exams yet!</h3>
          <p style={{ color: '#666' }}>Click the button above to create your first exam.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {exams.map(exam => (
            <div key={exam.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{exam.title}</h3>
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  Status: <strong style={{ color: exam.status === 'ACTIVE' ? '#2ecc71' : '#f39c12' }}>{exam.status}</strong> | Passing Grade: {exam.passingGrade}
                </span>
              </div>
              <div>
                <select
                  value={exam.status}
                  onChange={(event) => handleStatusChange(exam.id, event.target.value)}
                  style={{ marginRight: '10px', padding: '6px 8px', border: '1px solid #bdc3c7', borderRadius: '4px' }}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button onClick={() => navigate(`/editor/${exam.id}`)} style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#ecf0f1', border: '1px solid #bdc3c7', borderRadius: '4px' }}>Edit</button>
                <button onClick={() => navigate(`/results/${exam.id}`)} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}>Results</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
