import React from 'react';
import '../styles/PopupMessage.css';

const PopupMessage = ({ message, onClose }) => {
  return (
    <div className="popup-message-overlay">
      <div className="popup-message-dialog">
        <h2>Notice</h2>
        <p>{message}</p>
        <div className="action-buttons">
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupMessage;
