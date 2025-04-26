
import React from 'react';

const PowerUpTimer = ({ activePowerUps }) => {
    return (
        <div className="powerup-timer">
            {activePowerUps.map((powerUp) => (
                <div key={powerUp.powerUp} className="powerup-item">
                    <span>{powerUp.powerUp}</span>
                    <span>{powerUp.remainingTime}s</span>
                </div>
            ))}
        </div>
    );
};

export default PowerUpTimer;
