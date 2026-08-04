import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { storageService } from '../../services/StorageService';

const StudentGrades = () => {
  const [user] = useState(() => storageService.getActiveUser());
  const [submissions] = useState(() => {
    const storedUser = storageService.getActiveUser();
    return storedUser?.role === 'STUDENT' ? mockDB.getSubmissionsByStudent(storedUser.id) : [];
  });

  if (!user || user.role !== 'STUDENT') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>My Grades</h2>

      {submissions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px dashed #ccc' }}>
          <h3>No submissions yet.</h3>
          <p style={{ color: '#666' }}>Your submitted exams and grades will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {submissions.map((submission) => (
              <div key={submission.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{submission.examTitle || 'Deleted exam'}</h3>
                  <span style={{ fontSize: '0.9em', color: '#7f8c8d' }}>Status: {submission.status}</span>
                </div>
                <strong style={{ color: submission.status === 'GRADED' ? '#27ae60' : '#c0392b' }}>
                  {submission.finalGrade !== null ? `${submission.finalGrade}/100` : 'Pending'}
                </strong>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentGrades;
