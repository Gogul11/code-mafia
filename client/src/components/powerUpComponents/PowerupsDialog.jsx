import React, { useState } from 'react';
import '../../styles/PowerupsDialog.css';

const PowerupsDialog = ({ onClose, powers, teams, onPowerSelect, onTeamSelect, onUsePower, coins }) => {
  const [selectedPower, setSelectedPower] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handlePowerClick = (power) => {
    setSelectedPower(power);
    onPowerSelect(power.effect);
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    onTeamSelect(team);
  };

  const handleUsePower = () => {
    onUsePower();
    setSelectedPower(null);
    setSelectedTeam(null);
  };


  return (
    <div className="powerups-dialog-overlay">
      <div className="powerups-dialog">
        <div className="coins-display">
          <img src="/assets/currency.svg" alt="Coins" className="coin-icon" />
          <span className="coin-count">{coins}</span>
        </div>

        <h2>Powerups</h2>
        <p>Select a power-up{(selectedPower && selectedPower.id !== 10 && selectedPower.id !== 8) ? ' and a target team' : ''}.</p>

        <div className="powerups-container">
          {/* Power-ups column */}
          <div className="powerups-column">
            {powers.map((power) => (
              <button
                key={power.id}
                className={`power-button ${selectedPower === power ? 'selected' : ''}`}
                onClick={() => handlePowerClick(power)}
              >
                <div className="icon-container">
                  <img src={power.icon} alt={power.name} className="power-icon" />
                  <div className="cost-badge">
                    <img src="/assets/currency.svg" alt="currency" className="currency-icon" />
                    <span className='power-cost'>{power.cost}</span>
                  </div>
                </div>
                <span className='power-name'>{power.name}</span>
              </button>
            ))}
          </div>


          {/* Teams column (only after selecting a power-up and not for shield) */}
          {selectedPower && selectedPower.id !== 10 && selectedPower.id !== 8 && (
            <div className="teams-column">
              <h3>Choose who to attack</h3>
              {teams
                .filter((team) => !team.isCurrentUser)
                .map((team) => (
                  <button
                    key={team.userID}
                    className={`team-button ${selectedTeam === team ? 'selected' : ''}`}
                    onClick={() => handleTeamClick(team)}
                  >
                    {team.username}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="close-button" onClick={onClose}>Close</button>
          <button
            className="execute-button"
            onClick={handleUsePower}
            disabled={!selectedPower}
          >
            Use Power
          </button>
        </div>
      </div>
    </div >
  );
};

export default PowerupsDialog;
