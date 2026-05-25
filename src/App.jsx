import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';

// Placeholder components for routing (we will build the real ones next!)
const TeacherDashboard = () => <div style={{ padding: '20px' }}><h2>Teacher Dashboard</h2><p>Welcome to the exam management area.</p></div>;
const StudentDashboard = () => <div style={{ padding: '20px' }}><h2>Student Dashboard</h2><p>Here are your available exams.</p></div>;

const App = () => {
  const [user, setUser] = useState(null);

  // Check if a user is already logged in when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('activeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Callback function passed to the Login component
  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('activeUser');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container" style={{ fontFamily: 'sans-serif' }}>
        
        {/* Basic Header showing active user and Logout button */}
        <header style={{ padding: '15px', backgroundColor: '#f4f4f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>ExamApp</h1>
          {user && (
            <div>
              <span style={{ marginRight: '15px' }}>Hello, {user.name} ({user.role})</span>
              <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
            </div>
          )}
        </header>

        {/* Routing Logic based on Authentication State */}
        <main>
          <Routes>
            {!user ? (
              // If no user is logged in, force them to the Login page
              <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            ) : (
              // If logged in, route based on their role
              <>
                {user.role === 'TEACHER' && (
                  <Route path="*" element={<TeacherDashboard />} />
                )}
                {user.role === 'STUDENT' && (
                  <Route path="*" element={<StudentDashboard />} />
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