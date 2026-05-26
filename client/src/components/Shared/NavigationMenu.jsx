import { NavLink, useNavigate } from 'react-router-dom';

const NavigationMenu = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/'); // Send them back to the login screen
  };

  // If no user is logged in, we don't render the navigation bar at all
  if (!user) return null;

  // --- Inline Styles ---
  const navStyle = {
    backgroundColor: '#2c3e50',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const linkStyle = {
    color: '#bdc3c7',
    textDecoration: 'none',
    marginRight: '20px',
    fontWeight: 'bold',
    transition: 'color 0.3s'
  };

  const activeStyle = {
    ...linkStyle,
    color: '#3498db' // Highlights the active page in blue
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '40px', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
          ExamApp
        </span>
        
        {/* Dynamic Links for Teachers */}
        {user.role === 'TEACHER' && (
          <>
            <NavLink to="/" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Dashboard</NavLink>
            <NavLink to="/editor" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Exam Editor</NavLink>
            <NavLink to="/results" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Results</NavLink>
          </>
        )}

        {/* Dynamic Links for Students */}
        {user.role === 'STUDENT' && (
          <>
            <NavLink to="/" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Dashboard</NavLink>
            <NavLink to="/exams" style={({ isActive }) => isActive ? activeStyle : linkStyle}>Available Exams</NavLink>
            <NavLink to="/grades" style={({ isActive }) => isActive ? activeStyle : linkStyle}>My Grades</NavLink>
          </>
        )}
      </div>

      <div>
        <span style={{ marginRight: '15px' }}>Hello, {user.name}</span>
        <button 
          onClick={handleLogoutClick} 
          style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavigationMenu;
