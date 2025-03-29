import React from 'react';
import PowerUpContainer from './powerUpComponents/PowerUpContainer';
import '../styles/PowerupsDialog.css';

const PowerupsDialog = ({ onClose }) => {

  return (
    <div className="powerups-dialog-overlay">
      <div className="powerups-dialog">
        <h2>Powerups</h2>
        <p>Select a powerup to use in this challenge!</p>
        
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PowerupsDialog;
