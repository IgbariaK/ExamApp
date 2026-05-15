// client/src/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getAllExams } from '../api/examService';

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getAllExams();
        setExams(data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Teacher Dashboard</h2>
      <p className="text-muted">Manage and view all E-Tests</p>
      
      {loading ? (
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : (
        <div className="row">
          {exams.map((exam) => (
            <div className="col-md-4 mb-3" key={exam.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{exam.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">Exam ID: {exam.id}</h6>
                  <p className="card-text">Questions: {exam.questions.length}</p>
                  <button className="btn btn-outline-primary btn-sm">Edit Exam</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;