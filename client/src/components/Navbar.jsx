import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page or refresh
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      {/* Wrap Logo and Title */}
      <div className="navbar-logo-title">
        <div className="navbar-logo">
          <img src="images/logo.png" alt="Logo" />
        </div>
        <div className="navbar-title">Codemafia</div>
      </div>

      {/* Logout Button */}
      <div className="navbar-logout">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;