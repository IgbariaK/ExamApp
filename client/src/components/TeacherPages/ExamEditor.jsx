import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';

const ExamEditor = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('activeUser'));

  // Form State
  const [title, setTitle] = useState('');
  const [passingGrade, setPassingGrade] = useState(60);
  const [questions, setQuestions] = useState([]);

  // Add a new blank question to the state
  const handleAddQuestion = () => {
    const newQuestion = {
      id: 'q_' + Date.now(),
      type: 'OPEN_ENDED', // Defaulting to open-ended for simplicity right now
      text: '',
      correctAnswer: '',
      points: 10
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update a specific question in the array
  const handleQuestionChange = (id, field, value) => {
    const updatedQuestions = questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

  // Save the exam to the database
  const handleSaveExam = (e) => {
    e.preventDefault();
    
    const newExam = {
      id: 'exam_' + Date.now(),
      teacherId: user.id,
      title: title || 'Untitled Exam',
      description: 'A new exam created by ' + user.name,
      status: 'ACTIVE',
      passingGrade: Number(passingGrade),
      questions: questions,
      createdAt: new Date()
    };

    mockDB.createExam(newExam);
    navigate('/'); // Send the teacher back to the dashboard
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Create New Exam</h2>
        <button onClick={() => navigate('/')} style={{ padding: '8px 12px', cursor: 'pointer' }}>Cancel</button>
      </div>

      <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Exam Metadata */}
        <div style={{ padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '8px', border: '1px solid #ccc' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Exam Title:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            style={{ width: '100%', padding: '8px', marginBottom: '15px', boxSizing: 'border-box' }}
            placeholder="e.g., Midterm Exam: Formal Languages"
          />

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Passing Grade:</label>
          <input 
            type="number" 
            value={passingGrade} 
            onChange={(e) => setPassingGrade(e.target.value)} 
            min="0" max="100" required
            style={{ width: '100px', padding: '8px' }}
          />
        </div>

        {/* Questions Section */}
        <div>
          <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Questions ({questions.length})</h3>
          
          {questions.map((q, index) => (
            <div key={q.id} style={{ padding: '15px', marginBottom: '15px', border: '1px solid #bdc3c7', borderRadius: '8px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Question {index + 1}</strong>
                <button type="button" onClick={() => setQuestions(questions.filter(quest => quest.id !== q.id))} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>Remove</button>
              </div>
              
              <input 
                type="text" 
                placeholder="Question text..." 
                value={q.text}
                onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
              />
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <input 
                    type="text" 
                    placeholder="Expected Answer (for auto-grading)" 
                    value={q.correctAnswer}
                    onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <input 
                    type="number" 
                    placeholder="Points" 
                    value={q.points}
                    onChange={(e) => handleQuestionChange(q.id, 'points', Number(e.target.value))}
                    min="1" required
                    style={{ width: '80px', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={handleAddQuestion} style={{ padding: '10px 15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
            + Add Question
          </button>
        </div>

        <button type="submit" style={{ padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '20px' }}>
          Save Exam & Publish
        </button>
      </form>
    </div>
  );
};

export default ExamEditor;