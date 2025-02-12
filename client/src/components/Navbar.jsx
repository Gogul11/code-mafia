import React from 'react';
import '../styles/Navbar.css'; // Import the CSS for styling

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img src="images/logo.png" alt="Logo" /> {/* Replace with your logo path */}
      </div>

      {/* Title */}
      <div className="navbar-title">
        Codemafia
      </div>
    </nav>
  );
};

export default Navbar;