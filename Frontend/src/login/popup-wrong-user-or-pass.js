import React from 'react';

const WrongUsernamePasswordPopup = ({ onClose }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h3>Wrong Username or Password</h3>
                <p>Please check your credentials and try again.</p>
                <button className="close-button" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default WrongUsernamePasswordPopup;
