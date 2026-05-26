import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService'; 
import { storageService } from '../../services/StorageService';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError(''); // Reset error state

    // Call the OOP Mock DB Service to verify credentials
    const user = mockDB.loginUser(email, password);

    if (user) {
      // Save the active session to local storage
      storageService.setJson('activeUser', user);
      
      // If a parent component (like AppRouter) passed a callback, trigger it
      if (onLoginSuccess) {
        onLoginSuccess(user);
      } else {
        // Fallback for testing before the router is built
        alert(`Welcome back, ${user.name}!`);
        window.location.reload();
      }
    } else {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login to ExamApp</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
      
      <div style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
        <p><strong>Test Accounts:</strong></p>
        <p>Teacher: smith@test.com / 1234</p>
        <p>Student: john@test.com / 1234</p>
      </div>

      <p style={{ marginTop: '15px', fontSize: '0.9em' }}>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
