import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { configurationService } from '../../services/ConfigurationService';
import { notifyService } from '../../services/NotifyService';
import { storageService } from '../../services/StorageService';

const ExamEditor = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const user = storageService.getJson('activeUser', null);
  const existingExam = examId ? mockDB.getExamById(examId) : null;
  const statuses = configurationService.get('examStatuses');

  // Form State
  const [title, setTitle] = useState(existingExam?.title || '');
  const [passingGrade, setPassingGrade] = useState(existingExam?.passingGrade || configurationService.get('defaultPassingGrade'));
  const [maxAttempts, setMaxAttempts] = useState(existingExam?.maxAttempts || 1);
  const [status, setStatus] = useState(existingExam?.status || 'DRAFT');
  const [questions, setQuestions] = useState(existingExam?.questions || []);

  // Add a new blank question to the state
  const handleAddQuestion = () => {
    const newQuestion = {
      id: 'q_' + Date.now(),
      type: 'OPEN_ENDED',
      text: '',
      correctAnswer: '',
      options: ['', ''],
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

  const handleQuestionTypeChange = (id, type) => {
    setQuestions(questions.map((question) => (
      question.id === id
        ? { ...question, type, correctAnswer: '', options: question.options?.length >= 2 ? question.options : ['', ''] }
        : question
    )));
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setQuestions(questions.map((question) => {
      if (question.id !== questionId) return question;
      const options = [...(question.options || ['', ''])];
      const previousValue = options[optionIndex];
      options[optionIndex] = value;
      return {
        ...question,
        options,
        correctAnswer: question.correctAnswer === previousValue ? value : question.correctAnswer,
      };
    }));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map((question) => (
      question.id === questionId ? { ...question, options: [...(question.options || ['', '']), ''] } : question
    )));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map((question) => {
      const options = question.options || ['', ''];
      if (question.id !== questionId || options.length <= 2) return question;
      const removedOption = question.options[optionIndex];
      return {
        ...question,
        options: question.options.filter((_, index) => index !== optionIndex),
        correctAnswer: question.correctAnswer === removedOption ? '' : question.correctAnswer,
      };
    }));
  };

  // Save the exam to the database
  const handleSaveExam = (e) => {
    e.preventDefault();

    const invalidChoiceQuestion = questions.find((question) => {
      if (question.type !== 'MULTIPLE_CHOICE') return false;
      const options = (question.options || []).map((option) => option.trim());
      return options.length < 2
        || new Set(options).size !== options.length
        || options.some((option) => !option)
        || !options.includes(question.correctAnswer);
    });
    if (invalidChoiceQuestion) {
      notifyService.error('Each multiple-choice question needs at least two unique options and one correct answer.');
      return;
    }
    
    const newExam = {
      id: existingExam?.id || 'exam_' + Date.now(),
      teacherId: user.id,
      title: title || 'Untitled Exam',
      description: existingExam?.description || 'A new exam created by ' + user.name,
      status,
      passingGrade: Number(passingGrade),
      maxAttempts: Number(maxAttempts),
      questions: questions,
      createdAt: existingExam?.createdAt || new Date().toISOString()
    };

    if (existingExam) {
      mockDB.updateExam(existingExam.id, newExam);
      notifyService.success('Exam updated successfully!');
    } else {
      mockDB.createExam(newExam);
      notifyService.success('Exam saved successfully!');
    }

    navigate('/'); // Send the teacher back to the dashboard
  };

  if (!user || user.role !== 'TEACHER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{existingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
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

          <label style={{ display: 'block', margin: '15px 0 5px', fontWeight: 'bold' }}>Allowed Attempts:</label>
          <input
            type="number"
            value={maxAttempts}
            onChange={(event) => setMaxAttempts(event.target.value)}
            min="1"
            required
            style={{ width: '100px', padding: '8px' }}
          />

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Passing Grade:</label>
          <input 
            type="number" 
            value={passingGrade} 
            onChange={(e) => setPassingGrade(e.target.value)} 
            min="0" max="100" required
            style={{ width: '100px', padding: '8px' }}
          />

          <label style={{ display: 'block', margin: '15px 0 5px', fontWeight: 'bold' }}>Status:</label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            style={{ width: '160px', padding: '8px' }}
          >
            {statuses.map((statusOption) => (
              <option key={statusOption} value={statusOption}>{statusOption}</option>
            ))}
          </select>
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

              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Question Type:</label>
              <select
                value={q.type || 'OPEN_ENDED'}
                onChange={(event) => handleQuestionTypeChange(q.id, event.target.value)}
                style={{ padding: '8px', marginBottom: '12px' }}
              >
                <option value="OPEN_ENDED">Open-ended</option>
                <option value="MULTIPLE_CHOICE">Multiple choice</option>
              </select>

              {q.type === 'MULTIPLE_CHOICE' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Answer Options:</label>
                  {(q.options || ['', '']).map((option, optionIndex) => (
                    <div key={optionIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctAnswer === option && option !== ''}
                        onChange={() => handleQuestionChange(q.id, 'correctAnswer', option)}
                        required
                        aria-label={`Mark option ${optionIndex + 1} as correct`}
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(event) => handleOptionChange(q.id, optionIndex, event.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                        style={{ flex: 1, padding: '8px' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(q.id, optionIndex)}
                        disabled={(q.options || []).length <= 2}
                        style={{ padding: '8px' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(q.id)} style={{ padding: '7px 12px' }}>
                    + Add Option
                  </button>
                  <small style={{ display: 'block', marginTop: '6px', color: '#666' }}>Select the radio button beside the correct answer.</small>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  {q.type !== 'MULTIPLE_CHOICE' && (
                    <input
                      type="text"
                      placeholder="Expected Answer"
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                      style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                  )}
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
          Save Exam
        </button>
      </form>
    </div>
  );
};

export default ExamEditor;
