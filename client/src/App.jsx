<<<<<<< HEAD
// client/src/App.jsx
import React, { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';

function App() {
  const [role, setRole] = useState(null); // null means sitting on the login screen
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Convert to lowercase to make the login case-insensitive
    const user = username.trim().toLowerCase(); 
    
    if (user === 'teacher') {
      setRole('teacher');
      setError('');
    } else if (user === 'student') {
      setRole('student');
      setError('');
    } else {
      setError('Invalid login. Please type "teacher" or "student".');
    }
=======
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import NavigationMenu from './components/Shared/NavigationMenu';
import TeacherDashboard from './components/TeacherPages/TeacherDashboard';
import ExamEditor from './components/TeacherPages/ExamEditor';
import StudentDashboard from './components/StudentPages/StudentDashboard';
import ExamTaker from './components/StudentPages/ExamTaker';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('activeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('activeUser');
    setUser(null);
>>>>>>> ee91afe (sorted all files and folders correctly and connected the teacher dashbord)
  };

  const handleLogout = () => {
    setRole(null);
    setUsername('');
  };

  // View 1: The Login Screen
  if (!role) {
    return (
      <div className="container mt-5 pt-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0 rounded-lg mt-5">
              <div className="card-header bg-dark text-white text-center py-3">
                <h3 className="font-weight-light my-2">E-Test System</h3>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleLogin}>
                  <div className="form-floating mb-3">
                    <input 
                      type="text" 
                      className="form-control" 
                      id="inputUsername" 
                      placeholder="teacher or student"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <label htmlFor="inputUsername">Username (Type 'teacher' or 'student')</label>
                  </div>
                  
                  {error && <div className="alert alert-danger py-2">{error}</div>}
                  
                  <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                    <button type="submit" className="btn btn-primary w-100 py-2">Login</button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center py-3">
                <div className="small text-muted">Use standard mock credentials to access the system.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 2: The Logged-In App (Teacher or Student Dashboard)
  return (
<<<<<<< HEAD
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow">
        <div className="container">
          <span className="navbar-brand fw-bold">E-Test System</span>
          <div className="d-flex align-items-center">
            <span className="text-light me-3">
              Logged in as: <span className="badge bg-secondary">{role === 'teacher' ? 'Teacher' : 'Student'}</span>
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
=======
    <Router>
      <div className="app-container" style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        
        <NavigationMenu user={user} onLogout={handleLogout} />
>>>>>>> ee91afe (sorted all files and folders correctly and connected the teacher dashbord)

        <main>
          <Routes>
            {!user ? (
              <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            ) : (
              <>
                {user.role === 'TEACHER' && (
                  <>
                    <Route path="/" element={<TeacherDashboard />} />
                    <Route path="/editor" element={<ExamEditor />} />
                    <Route path="/editor/:examId" element={<ExamEditor />} />
                    <Route path="*" element={<TeacherDashboard />} />
                  </>
                )}
                {user.role === 'STUDENT' && (
                  <>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/take-exam/:examId" element={<ExamTaker />} />
                    <Route path="*" element={<StudentDashboard />} />
                  </>
                )}
              </>
            )}
          </Routes>
        </main>
        
      </div>
    </Router>
  );
};

export default App;