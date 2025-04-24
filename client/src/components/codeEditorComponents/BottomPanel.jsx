import React, { useState } from 'react';
import '../../styles/BottomPanel.css'; // Import the CSS for styling

const BottomPanel = ({ currentQuestion, totalQuestions, xp, isPowerupsDialogOpen ,setPowerupsDialogOpen, setCurrentQuestion, gotoNextQuestion, gotoPrevQuestion, submitRef }) => {
  const [isPlaylistExpanded, setPlaylistExpanded] = useState(false);

  const togglePlaylist = () => {
    setPlaylistExpanded(!isPlaylistExpanded);
  };

  const handleProblemClick = (index) => {
    setCurrentQuestion(index); // Set the current question based on the clicked index
    setPlaylistExpanded(false); // Collapse the playlist after a question is selected
  };

  const handleSubmitCode = () => {
    submitRef.current?.handleRunCode("submitcode");
  }

  return (
    <div className="bottom-panel">
      {/* Combined Playlist Icon and Question Info */}
      <div className="playlist-and-question">
        {/* Playlist Icon and Expanded Problems */}
        <div className="playlist-section">
          <div className="playlist-icon" onClick={togglePlaylist}>
            <span>≡</span>
          </div>
          {isPlaylistExpanded && (
            <div className="playlist-problems">
              <ul>
                {Array.from({ length: totalQuestions }, (_, i) => (
                  <li
                    key={i}
                    onClick={() => handleProblemClick(i + 1)}
                  >
                    Problem {i + 1}
                  </li>
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
          <div className="xp">XP: {xp}</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="navigation-buttons">
        <button className="nav-button prev-button" onClick={gotoPrevQuestion}>Prev</button>
        <button className="nav-button complete-button" onClick={handleSubmitCode}>Submit</button>
        <button className="nav-button next-button" onClick={gotoNextQuestion}>Next</button>
      </div>

      {/* Active Player Icons */}
      {/*<div className="active-players">
         {players.map((player, index) => (
          <div key={index} className="player-icon">
            {player.icon}
          </div>
        ))}
      </div> */}

      {/* Powerups */}
      <div className="powerups-section"></div>
        <button className="nav-button powerups-button" onClick={() => setPowerupsDialogOpen(true)}>Powerups</button>
      </div>
  );
};

export default BottomPanel;