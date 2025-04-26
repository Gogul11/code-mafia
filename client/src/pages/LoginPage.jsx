import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';

function LoginPage({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/login`, {
        username,
        password
      });
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      if (response.data?.message) {
        alert(response.data.message);
      }
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default LoginPage;
