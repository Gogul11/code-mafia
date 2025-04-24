import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCode, FaTrophy, FaSignOutAlt } from "react-icons/fa";
import "../styles/HomePage.css";
import LeaderBoard from "../components/LeaderBoard";
import Navbar from "../components/Navbar";

const HomePage = ({ isLoggedIn }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // Track the current page
  const navigate = useNavigate();

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLoginClick = () => {
    navigate("/login"); // Redirect to /login for the Login page
  };

  const handleNavigation = (page) => {
    if (page === "editor") {
      navigate("/editor"); // Redirect to /editor for the Code Editor
    } else {
      setCurrentPage(page); // Update the current page state for Homepage and Leaderboard
    }
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Redirect to login page or refresh
    window.location.href = "/";
  };

  const [elementCount, setElementCount] = useState(0); // Track the number of elements

  // Function to create a falling element
  const createFallingElement = () => {
    const container = document.querySelector(".falling-elements");
    if (!container || elementCount >= 15) return; // Limit to 10 elements

    const element = document.createElement("img");
    const assets = [
      "/assets/currency.svg",
      "/assets/ansh.png",
      "/assets/shield.svg",
    ]; // Paths relative to public folder
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
          <div className="pixel-art-character"></div>{" "}
          {/* Pixel art character. the square at the bottom right */}
          <div className="scanlines"></div> {/* CRT scanline effect */}
          <div className="falling-elements"></div>
        </div>
      ) : (
        <div className="logged-in-container">
          <Navbar />
          <p className="rules">RULES</p>
          <ul className="rules-content">
            <li>
              This competition is completely online and conducted on ACM CEG's
              website.
            </li>
            <li>Teams can consist of either one or two participants.</li>
            <li>
              If a team has two members, both participants must be in the same
              physical location and use a single system under one login. Each
              team will be provided with one login ID only.
            </li>
            <li>
              Cheating is strictly prohibited. This includes using external
              websites, generative AI tools (such as ChatGPT, Gemini, etc.), or
              any unauthorized resources. Violations will lead to immediate
              disqualification.
            </li>
            <li>
              Multiple logins across devices are not allowed. Any attempt to
              access the platform from more than one device will result in
              termination of participation.
            </li>
          </ul>
          <p className="rules-title">GAME MECHANICS</p>
          <p className="rules">
            <img
              className="coin"
              style={{scale: '1.3'}}
              src="/assets/currency.svg"
              alt="coin"
            />
            CURRENCY
          </p>
          <ul className="rules-content">
            <li>
              Currency serves as the backbone of the event and can be used to
              purchase sabotages and shields
            </li>
            <li>
              Each team will start with 20 coins (units of currency). Upon
              successfully solving a question, the team will earn an additional
              5 coins.
            </li>
            <li>
              There are no rewards for hoarding currency. Teams are encouraged
              to spend their coins strategically—go wild!
            </li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/shield.svg" alt="shield" />
            SHIELD
          </p>
          <ul className="rules-content">
            <li>Each team starts with 3 shields to block sabotages.</li>
            <li>Shields can be replenished using coins.</li>
            <li>
              Smart usage decides whether you play aggressive or defensive.
            </li>
          </ul>
          <p className="rules-title">SABOTAGES & POWER-UPS</p>
          <p className="rules">
            <img
              className="coin"
              src="/assets/systemoverload.png"
              alt="overload"
            />
            SYSTEM OVERLOAD
          </p>
          <ul className="rules-content">
            <li>‘Glitches’ the on-screen display.</li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/innocency.png" alt="innoceny" />
            INNOCENCY
          </p>
          <ul className="rules-content">
            <li>Innocency is high-risk high-reward powerup</li>
            <li>
              Users willingly drop their own shields in return for increased
              rate of coin accumulation for a duration of time.
            </li>
            <li>
              A few coins away from a big sabotage? Issue this, get the money
              for your sabotage as a result, issue that in turn and use the
              opportunity to get a lead
            </li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/snowflake.svg" alt="snowflake" />
            ZERO KELVIN
          </p>
          <ul className="rules-content">
            <li>
              Affected teams ‘freeze’/stop what they are doing for a duration of
              time.
            </li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/windmill.png" alt="windmill" />
            WINDMILL
          </p>
          <ul className="rules-content">
            <li>
              Low-Risk Low-Reward. Sabotaged team’s computer rotates their
              displays anywhere from 1-5 times over the course of 3 minutes in a
              cyclical direction
            </li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/smokescreen.png" style={{scale: '1.5'}} alt="smokescreen" />
            SMOKE SCREEN
          </p>
          <ul className="rules-content">
            <li>
            Darken the text color or reduce their visibility to the point of near unusability
            </li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/wallbreaker.png" style={{scale: '2'}} alt="wallbreaker" />
            WALL BREAKER
          </p>
          <ul className="rules-content">
            <li>
            Takes down the shields of the targeted team. Just to screw with them, of course.
            </li>
          </ul>
          <p className="rules">
            <img className="coin" style={{scale: '2'}} src="/assets/suicidebomber.png" alt="bomb" />
            SUICIDE BOMBER
          </p>
          <ul className="rules-content">
            <li>Takes down both your shield and a chosen teams' shield.</li> 
            <li>Users of this get a decent sum of coins to use to compensate.</li>
            <li>High Risk High Reward</li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/zipbomb.png" style={{scale: '1.5'}} alt="zip" />
            ZIP BOMB
          </p>
          <ul className="rules-content">
            <li>Opens random dialog boxes across the webapp screen that require the team to kill their flow and remove them</li>
          </ul>
          <p className="rules">
            <img className="coin" src="/assets/swap.svg" alt="swap" />
            SITUS INVERSUS
          </p>
          <ul className="rules-content">
            <li>Flips the screen horizontally once. Or rotated around</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HomePage;
