import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import NavigationMenu from './components/Shared/NavigationMenu';
import TeacherDashboard from './components/TeacherPages/TeacherDashboard';
import ExamEditor from './components/TeacherPages/ExamEditor';
import ExamResults from './components/TeacherPages/ExamResults';
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
  };

  return (
    <Router>
      <div className="app-container" style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        
        <NavigationMenu user={user} onLogout={handleLogout} />

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
                    <Route path="/results/:examId" element={<ExamResults />} />
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