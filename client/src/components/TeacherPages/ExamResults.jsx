import { useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { notifyService } from '../../services/NotifyService';
import { storageService } from '../../services/StorageService';

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = storageService.getJson('activeUser', null);
  const exam = mockDB.getExamById(examId);
  const [submissions, setSubmissions] = useState(() => mockDB.getSubmissionsForExam(examId));
  const [gradingScores, setGradingScores] = useState({});

  const handleGradeSubmit = (subId, e) => {
    e.preventDefault();
    const score = gradingScores[subId];
    if (score !== undefined) {
      mockDB.updateSubmissionGrade(subId, Number(score));
      setSubmissions(mockDB.getSubmissionsForExam(examId)); // Refresh the list
      notifyService.success('Grade saved successfully!');
    }
  };

  if (!user || user.role !== 'TEACHER' || !exam) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Results: {exam.title}</h2>
        <button onClick={() => navigate('/results')} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#ecf0f1', border: '1px solid #bdc3c7', borderRadius: '4px' }}>
          Back to Results
        </button>
      </div>

      {submissions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '2px dashed #ccc' }}>
          <h3>No submissions yet!</h3>
          <p style={{ color: '#666' }}>Students haven't taken this exam yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {submissions.map(sub => (
            <div key={sub.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#2c3e50' }}>Student ID: {sub.studentId}</h3>
                <span style={{ fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', backgroundColor: sub.status === 'GRADED' ? '#d4efdf' : '#fadbd8', color: sub.status === 'GRADED' ? '#27ae60' : '#c0392b' }}>
                  {sub.status} {sub.finalGrade !== null ? `(${sub.finalGrade}/100)` : ''}
                </span>
              </div>

              {exam.questions.map((q, index) => (
                <div key={q.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#fdfdfd', borderLeft: '4px solid #3498db', borderRadius: '4px' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Q{index + 1}: {q.text} ({q.points} pts)</p>
                  <p style={{ margin: '0 0 10px 0', color: '#7f8c8d', fontSize: '0.9em' }}>Expected Answer: {q.correctAnswer || 'None provided'}</p>
                  <div style={{ margin: 0, padding: '10px', backgroundColor: '#ecf0f1', borderRadius: '4px', border: '1px solid #bdc3c7' }}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>Student's Answer:</strong> 
                    {sub.answers[q.id] || <span style={{ fontStyle: 'italic', color: '#95a5a6' }}>*No answer provided*</span>}
                  </div>
                </div>
              ))}

              <form onSubmit={(e) => handleGradeSubmit(sub.id, e)} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                <label style={{ fontWeight: 'bold', margin: 0 }}>Assign Final Grade:</label>
                <input 
                  type="number" 
                  min="0" max="100" required
                  placeholder="e.g. 85"
                  value={gradingScores[sub.id] !== undefined ? gradingScores[sub.id] : (sub.finalGrade || '')}
                  onChange={(e) => setGradingScores({...gradingScores, [sub.id]: e.target.value})}
                  style={{ padding: '8px', width: '80px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Save Grade
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamResults;
