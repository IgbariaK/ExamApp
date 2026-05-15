
import React, { useState } from 'react';
import { getExamById } from '../api/examService';

const StudentPortal = () => {
  const [examId, setExamId] = useState('');
  const [exam, setExam] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchExam = async (e) => {
    e.preventDefault();
    if (!examId.trim()) return;

    setLoading(true);
    setError('');
    setExam(null);

    try {
      const data = await getExamById(examId);
      setExam(data);
    } catch (err) {
      setError(err.message || "Failed to fetch exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h2 className="mb-0">Student Portal</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleFetchExam} className="mb-4">
            <div className="mb-3">
              <label htmlFor="examId" className="form-label">Enter Exam ID to Start</label>
              <div className="input-group">
                <input
                  type="text"
                  id="examId"
                  className="form-control"
                  placeholder="e.g., exam-1"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  disabled={loading}
                />
                <button 
                  className="btn btn-primary" 
                  type="submit"
                  disabled={loading || !examId.trim()}
                >
                  {loading ? 'Searching...' : 'Find Exam'}
                </button>
              </div>
            </div>
          </form>

          {error && <div className="alert alert-danger">{error}</div>}

          {exam && (
            <div className="card border-primary">
              <div className="card-body">
                <h4 className="card-title text-primary">{exam.title}</h4>
                <p className="card-text">This exam contains {exam.questions.length} questions.</p>
                <button className="btn btn-success w-100">Start Exam Now</button>
              </div>
            </div>
          )}

          {!exam && !error && !loading && (
            <div className="text-center py-5 text-muted">
              <p>Ready to take an exam? Enter your Exam ID above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
