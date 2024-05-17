// src/Login.jsx
import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [groupName, setGroupName] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [groupNameError, setGroupNameError] = useState('');
  const [userNameError, setUserNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset error messages
    setGroupNameError('');
    setUserNameError('');
    setPasswordError('');
    setLoginError('');
    console.log('Success:', userName);
    // Form validation
    if (!groupName) {
      setGroupNameError('Please enter your group name');
      return;
    }

    if (!userName) {
      setUserNameError('Please enter your username');
      return;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      return;
    }
    try {
      // Make API request to check if account exists
      const response = await fetch(`https://dent-backend.onrender.com/user/login/?group_name=${groupName}&user_name=${userName}&password=${password}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response)
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        if (data.isAdmin) {
          setLoginSuccess('Login successful. You are an admin.');
        } else {
          setLoginSuccess('Login successful. You are a member.');
        }
      } else {
        if (response.status === 400) {
          setLoginError('Password is incorrect.');
        } else if (response.status === 404) {
          setLoginError('User not found.');
        } else {
          setLoginError('Login failed. Please try again later.');
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setLoginError('An error occurred. Please try again later.');
    }
    
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="groupName">Group Name</label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          {groupNameError && <div className="error">{groupNameError}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="userName">Username</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          {userNameError && <div className="error">{userNameError}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {passwordError && <div className="error">{passwordError}</div>}
        </div>
        <button type="submit" className="login-button">Login</button>
        {loginSuccess && <div className="success">{loginSuccess}</div>}
        {loginError && <div className="error">{loginError}</div>}
      </form>
    </div>
  );
}

export default Login;