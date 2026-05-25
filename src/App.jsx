import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import NavigationMenu from './components/Shared/NavigationMenu'; // <-- Import the new menu

// Placeholder components for routing
const TeacherDashboard = () => <div style={{ padding: '20px' }}><h2>Teacher Dashboard</h2><p>Welcome to the exam management area.</p></div>;
const StudentDashboard = () => <div style={{ padding: '20px' }}><h2>Student Dashboard</h2><p>Here are your available exams.</p></div>;

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
  };

  return (
    <Router>
      <div className="app-container" style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        
        {/* Our new dynamic navigation menu */}
        <NavigationMenu user={user} onLogout={handleLogout} />

        <main>
          <Routes>
            {!user ? (
              <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            ) : (
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