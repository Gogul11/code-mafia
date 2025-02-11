import React, { useState } from 'react';
import '../../styles/BottomPanel.css'; // Import the CSS for styling

const BottomPanel = ({ currentQuestion, totalQuestions, xp, players }) => {
  const [isPlaylistExpanded, setPlaylistExpanded] = useState(false);

  const togglePlaylist = () => {
    setPlaylistExpanded(!isPlaylistExpanded);
  };

  return (
    <div className="bottom-panel">
      {/* Combined Playlist Icon and Question Info */}
      <div className="playlist-and-question">
        {/* Playlist Icon and Expanded Problems */}
        <div className="playlist-section">
          <div className="playlist-icon" onClick={togglePlaylist}>
            <span>≡</span> {/* Replace with an actual icon */}
          </div>
          {isPlaylistExpanded && (
            <div className="playlist-problems">
              <ul>
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <li key={i}>Problem {i + 1}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Current Question and XP */}
        <div className="question-info">
          <div className="question-number">
            Question {currentQuestion} of {totalQuestions}
          </div>
          <div className="question-title">Sample Question Title</div>
          <div className="xp">XP: {xp}</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button className="nav-button prev-button">Prev</button>
        <button className="nav-button complete-button">Complete</button>
        <button className="nav-button next-button">Next</button>
      </div>

      {/* Active Player Icons */}
      <div className="active-players">
        {players.map((player, index) => (
          <div key={index} className="player-icon">
            {player.icon} {/* Replace with actual player icons */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomPanel;