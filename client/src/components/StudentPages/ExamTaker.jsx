import { useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { notifyService } from '../../services/NotifyService';
import { storageService } from '../../services/StorageService';

const ExamTaker = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const exam = mockDB.getExamById(examId);
  const [answers, setAnswers] = useState({}); // Stores answers as { questionId: "user text" }
  const [error, setError] = useState('');

  const user = storageService.getJson('activeUser', null);
  const attemptCount = user?.role === 'STUDENT'
    ? mockDB.getSubmissionsByStudent(user.id).filter((submission) => submission.examId === examId).length
    : 0;
  const maxAttempts = Number(exam?.maxAttempts ?? 1);
  const attemptsExhausted = attemptCount >= maxAttempts;

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (attemptsExhausted) {
      setError(`You have used all ${maxAttempts} attempt(s) for this exam.`);
      return;
    }
    
    // Create the submission record
    const submission = {
      examId: exam.id,
      studentId: user.id,
      answers: answers,
      finalGrade: null, // Needs teacher grading!
      status: 'SUBMITTED',
      submittedAt: new Date()
    };

    try {
      mockDB.submitExam(submission);
      notifyService.success('Exam submitted successfully!');
      navigate('/'); // Send back to dashboard
    } catch (submitError) {
      setError(submitError.message || 'Could not submit the exam.');
    }
  };

  if (!user || user.role !== 'STUDENT' || !exam || exam.status !== 'ACTIVE' || attemptsExhausted) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>{exam.title}</h2>
        <p style={{ margin: 0, color: '#666' }}>{exam.description}</p>
        <p style={{ margin: '8px 0 0', color: '#666' }}>Attempt {attemptCount + 1} of {maxAttempts}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

        {exam.questions.map((q, index) => (
          <div key={q.id} style={{ padding: '20px', marginBottom: '20px', border: '1px solid #bdc3c7', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 15px 0', fontSize: '1.1rem' }}>
              {index + 1}. {q.text} <span style={{ fontWeight: 'normal', color: '#7f8c8d', fontSize: '0.9rem' }}>({q.points} pts)</span>
            </p>
            <textarea
              required
              rows="4"
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              placeholder="Type your answer here..."
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        ))}

        <button 
          type="submit" 
          style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
        >
          Submit Exam
        </button>
      </form>
    </div>
  );
};

export default ExamTaker;
