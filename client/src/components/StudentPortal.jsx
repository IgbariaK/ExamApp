// client/src/StudentPortal.jsx
import React, { useState } from 'react';
import { getExamById } from "../api/examService";

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
    } catch (err) {
      setError('Exam not found. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Student Portal</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleStartExam}>
                <div className="mb-3">
                  <label htmlFor="examIdInput" className="form-label">Enter Exam ID to Start</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="examIdInput" 
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Searching...' : 'Start Exam'}
                </button>
              </form>

              {error && <div className="alert alert-danger mt-3">{error}</div>}

              {currentExam && (
                <div className="alert alert-success mt-3">
                  <h5>Exam Found: {currentExam.title}</h5>
                  <p className="mb-0">This exam has {currentExam.questions.length} questions. Good luck!</p>
                  {/* Future implementation: Render the actual test questions here */}
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