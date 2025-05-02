import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for redirection

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();  // Hook to navigate to other routes

  console.log('Rendering Login Component'); // Debug log

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);  // Set loading state to true when submitting the form

    try {
      const response = await axios.post(
        'http://localhost:5000/login',
        { email, password },
        { withCredentials: true }
      );
      console.log('Login response:', response.data);

      if (response.data.success) {
        alert('Login successful!');
        onLogin();  // Call onLogin to update parent component's login state
        navigate('/dashboard'); // Redirect to Dashboard after successful login
      } else {
        setErrorMsg(response.data.error || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setErrorMsg('Server error. Please try again later.');
    } finally {
      setLoading(false);  // Set loading state to false after the request is completed
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Student Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <div style={{ marginBottom: '10px' }}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />{' '}
          Show Password
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {errorMsg && (
          <p style={{ color: 'red', marginTop: '10px' }}>{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

export default Login;
