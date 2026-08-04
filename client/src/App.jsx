import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import NavigationMenu from './components/Shared/NavigationMenu';
import TeacherDashboard from './components/TeacherPages/TeacherDashboard';
import ExamEditor from './components/TeacherPages/ExamEditor';
import ExamResults from './components/TeacherPages/ExamResults';
import TeacherResultsOverview from './components/TeacherPages/TeacherResultsOverview';
import StudentDashboard from './components/StudentPages/StudentDashboard';
import ExamTaker from './components/StudentPages/ExamTaker';
import StudentGrades from './components/StudentPages/StudentGrades';
import { storageService } from './services/StorageService';
import { configurationService } from './services/ConfigurationService';

const App = () => {
  if (configurationService.get('dataSource') === 'server') {
    storageService.resetForVersion('server-v1');
  }

  const [user, setUser] = useState(() => {
    const storedUser = storageService.getJson('activeUser', null);

    if (configurationService.get('dataSource') === 'server' && storedUser && !storedUser.token) {
      storageService.removeItem('activeUser');
      return null;
    }

    return storedUser;
  });

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    storageService.removeItem('activeUser');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container" style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        
        <NavigationMenu user={user} onLogout={handleLogout} />

        <main>
          <Routes>
            {!user ? (
              <>
                <Route path="/register" element={<Register onRegisterSuccess={handleLoginSuccess} />} />
                <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              </>
            ) : (
              <>
                {user.role === 'TEACHER' && (
                  <>
                    <Route path="/" element={<TeacherDashboard />} />
                    <Route path="/editor" element={<ExamEditor />} />
                    <Route path="/editor/:examId" element={<ExamEditor />} />
                    <Route path="/results" element={<TeacherResultsOverview />} />
                    <Route path="/results/:examId" element={<ExamResults />} />
                    <Route path="*" element={<TeacherDashboard />} />
                  </>
                )}
                {user.role === 'STUDENT' && (
                  <>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/exams" element={<StudentDashboard />} />
                    <Route path="/grades" element={<StudentGrades />} />
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
