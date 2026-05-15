// client/src/App.jsx

import React, { useState } from 'react';
// Update these two lines to include the /components path:
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';

// ... the rest of your App component code stays exactly the same

function App() {
  const [role, setRole] = useState('student'); // 'teacher' or 'student'

  const toggleRole = () => {
    setRole(prevRole => prevRole === 'student' ? 'teacher' : 'student');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <span className="navbar-brand">E-Test System</span>
          <button className="btn btn-outline-light ms-auto" onClick={toggleRole}>
            Switch to {role === 'student' ? 'Teacher' : 'Student'} View
          </button>
        </div>
      </nav>

      <main>
        {role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
      </main>
    </div>
  );
}

export default App;