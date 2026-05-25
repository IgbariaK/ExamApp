import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';

const ExamTaker = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({}); // Stores answers as { questionId: "user text" }

  const user = JSON.parse(localStorage.getItem('activeUser'));

  useEffect(() => {
    const fetchedExam = mockDB.getExamById(examId);
    if (fetchedExam) {
      setExam(fetchedExam);
    } else {
      alert("Exam not found!");
      navigate('/');
    }
  }, [examId, navigate]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create the submission record
    const submission = {
      id: 'sub_' + Date.now(),
      examId: exam.id,
      studentId: user.id,
      answers: answers,
      finalGrade: null, // Needs teacher grading!
      status: 'SUBMITTED',
      submittedAt: new Date()
    };

    mockDB.submitExam(submission);
    alert("Exam submitted successfully!");
    navigate('/'); // Send back to dashboard
  };

  if (!exam) return <div>Loading exam...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>{exam.title}</h2>
        <p style={{ margin: 0, color: '#666' }}>{exam.description}</p>
      </div>

      <form onSubmit={handleSubmit}>
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