import React, { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCode, FaTrophy, FaFolderOpen } from "react-icons/fa";
import "../styles/HomePage.css";

const HomePage = ({ isLoggedIn }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // Track the current page
  const navigate = useNavigate();

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLoginClick = () => {
    // Redirect to login page or handle login logic
    console.log("Redirecting to login...");
  };

  const handleNavigation = (page) => {
    if (page === "editor") {
      navigate("/editor"); // Redirect to /editor for the Code Editor
    } else {
      setCurrentPage(page); // Update the current page state for Homepage and Leaderboard
    }
  };

  const [elementCount, setElementCount] = useState(0); // Track the number of elements

  // Function to create a falling element
  const createFallingElement = () => {
    const container = document.querySelector(".falling-elements");
    if (!container || elementCount >= 10) return; // Limit to 10 elements

    const element = document.createElement("img");
    const assets = ["/assets/currency.svg", "/assets/ansh.png"]; // Paths relative to public folder
    const randomAsset = assets[Math.floor(Math.random() * assets.length)];

    element.src = randomAsset; // Use the path directly
    element.className = "falling-element";
    element.style.left = `${Math.random() * 100}vw`; // Random horizontal position
    element.style.animationDuration = `${Math.random() * 2 + 3}s`; // Random fall speed (3-5 seconds)
    element.style.width = `${Math.random() * 40 + 20}px`; // Random size (20-60px)

    container.appendChild(element);
    setElementCount((prev) => prev + 1); // Increment element count

    // Remove the element after it falls
    element.addEventListener("animationend", () => {
      container.removeChild(element);
      setElementCount((prev) => prev - 1); // Decrement element count
    });
  };

  // Start the falling effect
  useEffect(() => {
    const interval = setInterval(createFallingElement, 500); // Create a new element every 500ms (0.5 second)
    return () => clearInterval(interval); // Cleanup on unmount
  }, [elementCount]); 

  return (
    <div className="homepage">
      {!isLoggedIn ? (
        <div className="landing-page">
          <h1 className="retro-text">Welcome to CODEMAFIA</h1>
          <p className="retro-subtext">Login to enter the realm</p>
          <button className="login-button" onClick={handleLoginClick}>
            Login
          </button>
          <div className="pixel-art-character"></div> {/* Pixel art character. the square at the bottom right */}
          <div className="scanlines"></div> {/* CRT scanline effect */}
          <div className="falling-elements"></div>
        </div>
      ) : (
        <div className="logged-in-container">
          <div
            className={`nav-sidebar ${isNavOpen ? "open" : "closed"}`}
            onClick={toggleNav}
          >
            <div className="hamburger-menu">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
            <div className="nav-links-div">
              <ul className="nav-links">
                <li onClick={() => handleNavigation("home")}>
                  <FaHome className="icon" title="Homepage" />
                  {isNavOpen && <span>Homepage</span>}
                </li>
                <li onClick={() => handleNavigation("editor")}>
                  <FaCode className="icon" title="Code Editor" />
                  {isNavOpen && <span>Code Editor</span>}
                </li>
                <li onClick={() => handleNavigation("leaderboard")}>
                  <FaTrophy className="icon" title="Leaderboard" />
                  {isNavOpen && <span>Leaderboard</span>}
                </li>
              </ul>
            </div>
          </div>
          <div className="main-content">
            {currentPage === "home" && (
              <>
                <h1>Welcome Back, Coder!</h1>
                <p>Start coding or check the leaderboard.</p>
              </>
            )}
            {currentPage === "leaderboard" && (
              <>
                <h1>Leaderboard</h1>
                <p>Check out the top coders.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;