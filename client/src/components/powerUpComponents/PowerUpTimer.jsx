
import React from 'react';
import '../../styles/PowerUpTimer.css';

const PowerUpTimer = ({ activePowerUps, powersList }) => {
    if (!activePowerUps.length) return null;

    return (
        <div className="powerup-timer">
            {activePowerUps.map((powerUp, index) => {
                const power = powersList.find(p => p.effect === powerUp.powerUp);

                return (
                    <div key={index} className="powerup-item">
                        {power && <img src={power.icon} alt={power.name} className="powerup-icon" />}
                        <span>{powerUp.remainingTime}s</span>
                    </div>
                );
            })}
        </div>
    );
};



export default PowerUpTimer;
