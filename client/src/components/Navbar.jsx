import React, { useState } from 'react';
import { FaHome, FaCode, FaTrophy, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  const navigate = useNavigate()
  const handleNavigation = (page) => {
    navigate(page)
    setIsNavOpen(false); // Close menu on mobile after selecting
  };

  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left" onClick={() => handleNavigation('/')}>
          <img src="assets/cm-logo-2.png" alt="Logo" className="logo" />
          <span className="navbar-title">CodeMafia</span>
        </div>

        <div className="navbar-links">
          <ul>
            <li onClick={() => handleNavigation('/')}>
              <FaHome className="icon" />
              <span>Home</span>
            </li>
            <li onClick={() => handleNavigation('/editor')}>
              <FaCode className="icon" />
              <span>Editor</span>
            </li>
            <li onClick={() => handleNavigation('/leader')}>
              <FaTrophy className="icon" />
              <span>Leaderboard</span>
            </li>
          </ul>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="icon" />
          <span>Logout</span>
        </button>

        <div className="hamburger-icon" onClick={toggleNav}>
          {isNavOpen ? <FaTimes /> : <FaBars />}
        </div>
      </nav>

      {/* Mobile sidebar */}
      <div className={`mobile-sidebar ${isNavOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => handleNavigation('/')}>
            <FaHome className="icon" />
            <span>Home</span>
          </li>
          <li onClick={() => handleNavigation('/editor')}>
            <FaCode className="icon" />
            <span>Editor</span>
          </li>
          <li onClick={() => handleNavigation('/leader')}>
            <FaTrophy className="icon" />
            <span>Leaderboard</span>
          </li>

          <li className='logout-button' onClick={handleLogout}>
            <FaSignOutAlt className="icon" />
            <span>Logout</span>
          </li>
        </ul>
       
      </div>
    </>
  );
};

export default Navbar;
