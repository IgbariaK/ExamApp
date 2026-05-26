// client/src/components/StudentPortal.jsx
import { useState } from 'react';
import { getExamById } from '../../api/examService';

const StudentPortal = () => {
  const [examId, setExamId] = useState('');
  const [currentExam, setCurrentExam] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartExam = async (e) => {
    e.preventDefault();
    setError('');
    setCurrentExam(null);
    
    if (!examId.trim()) {
      setError('Please enter a valid Exam ID.');
      return;
    }

    setLoading(true);
    try {
      const exam = await getExamById(examId);
      setCurrentExam(exam);
    } catch {
      setError('Exam not found. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8"> {/* Made this slightly wider for the test view */}
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Student Portal</h4>
            </div>
            <div className="card-body">
              
              {/* Only show the search form if an exam HASN'T been loaded yet */}
              {!currentExam && (
                <form onSubmit={handleStartExam}>
                  <div className="mb-3">
                    <label htmlFor="examIdInput" className="form-label">Enter Exam ID to Start</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="examIdInput" 
                      value={examId}
                      onChange={(e) => setExamId(e.target.value)}
                      placeholder="Try entering '1' or '2'"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? 'Searching...' : 'Start Exam'}
                  </button>
                </form>
              )}

              {error && <div className="alert alert-danger mt-3">{error}</div>}

              {/* The New Question Display Feature */}
              {currentExam && (
                <div>
                  <div className="alert alert-success mb-4">
                    <h5 className="alert-heading">Exam Started: {currentExam.title}</h5>
                    <p className="mb-0">Please answer all {currentExam.questions.length} questions below.</p>
                  </div>

                  {/* Map through the questions array and render a card for each */}
                  {currentExam.questions.map((question, index) => (
                    <div className="card mb-3 border-primary" key={question.id}>
                      <div className="card-header bg-light">
                        <strong>Question {index + 1}</strong>
                      </div>
                      <div className="card-body">
                        <p className="card-text">{question.text}</p>
                        <textarea 
                          className="form-control" 
                          rows="2" 
                          placeholder="Type your answer here..."
                        ></textarea>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-4">
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => setCurrentExam(null)}
                    >
                      Cancel Exam
                    </button>
                    <button className="btn btn-success px-5">
                      Submit Exam
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
