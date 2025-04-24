import React, { useState, useEffect } from 'react';
import '../../styles/BottomPanel.css';

const BottomPanel = ({ 
  currentQuestion, 
  totalQuestions, 
  xp, 
  isPowerupsDialogOpen,
  setPowerupsDialogOpen, 
  setCurrentQuestion, 
  gotoNextQuestion, 
  gotoPrevQuestion, 
  submitRef,
  questions // Add questions prop that contains the question data with status
}) => {
  const [isPlaylistExpanded, setPlaylistExpanded] = useState(false);

  const togglePlaylist = () => {
    setPlaylistExpanded(!isPlaylistExpanded);
  };

  const handleProblemClick = (index) => {
    setCurrentQuestion(index);
    setPlaylistExpanded(false);
  };

  const handleSubmitCode = () => {
    submitRef.current?.handleRunCode("submitcode");
  };

  const handleRunTestCode = () => {
    submitRef.current?.handleRunCode("runtestcase");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Accepted':
        return 'status-accepted';
      case 'Partial':
        return 'status-partial';
      case 'unattempted':
        return 'status-unattempted';
      default:
        return '';
    }
  };

  return (
    <div className="bottom-panel">
      <div className="playlist-and-question">
        <div className="playlist-section">
          <div className="playlist-icon" onClick={togglePlaylist}>
            <span>≡</span>
          </div>
          {isPlaylistExpanded && (
            <div className="playlist-problems">
              <ul>
                {questions?.map((q, index) => (
                  <li
                    key={q.id}
                    onClick={() => handleProblemClick(index + 1)}
                    className={getStatusColor(q.status)}
                  >
                    {index+1}.{q.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="question-info">
          <div className="question-number">
            Question {currentQuestion} of {totalQuestions}
          </div>
          <div className="xp">XP: {xp}</div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="nav-button prev-button" onClick={gotoPrevQuestion}>Prev</button>
        <button className="nav-button run-button" onClick={handleRunTestCode}>RunCode</button>
        <button className="nav-button submit-button" onClick={handleSubmitCode}>Submit</button>
        <button className="nav-button next-button" onClick={gotoNextQuestion}>Next</button>
      </div>

      <div className="powerups-section">
        <button className="nav-button powerups-button" onClick={() => setPowerupsDialogOpen(true)}>Powerups</button>
      </div>
    </div>
  );
};

export default BottomPanel;