import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockDB } from '../../services/MockDBService';
import { configurationService } from '../../services/ConfigurationService';
import { notifyService } from '../../services/NotifyService';
import { storageService } from '../../services/StorageService';

const Register = ({ onRegisterSuccess }) => {
  const roles = configurationService.get('roles');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');

  const handleRegister = (event) => {
    event.preventDefault();
    setError('');

    try {
      const user = mockDB.registerUser({
        name,
        role,
        email,
        passwordHash: password,
      });

      storageService.setJson('activeUser', user);
      notifyService.success(`Welcome, ${user.name}!`);
      onRegisterSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: '420px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create ExamApp Account</h2>

      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input value={name} onChange={(event) => setName(event.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
          <select value={role} onChange={(event) => setRole(event.target.value)} style={{ width: '100%', padding: '8px' }}>
            {roles.map((roleOption) => (
              <option key={roleOption} value={roleOption}>{roleOption}</option>
            ))}
          </select>
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>

      <p style={{ marginTop: '15px', fontSize: '0.9em' }}>
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
};

export default Register;
