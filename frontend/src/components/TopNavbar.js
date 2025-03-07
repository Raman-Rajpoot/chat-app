import React, { useState } from 'react';
import './TopNavbar.css';
import searchIcon from "../images/search.png";
function TopNavbar() {
    const [chatType, setChatType] = useState("Normal");

    return (
        <div className="chatWindow__header">
            <h3 className='chat-person-name'>Chat with User 1</h3>
            
            <div className='type-of-chat'>
                <div 
                    className={`chat-type-btn ${chatType === 'Normal' ? 'selected' : ''}`}
                    onClick={() => setChatType("Normal")}
                >
                    Normal
                    <div className="glow-effect"></div>
                </div>
                <div 
                    className={`chat-type-btn ${chatType === 'Collaborative' ? 'selected' : ''}`}
                    onClick={() => setChatType("Collaborative")}
                >
                    Collab
                    <div className="glow-effect"></div>
                </div>
            </div>

            {/* Only Search Icon */}
            <button className="nav-icon">
            <img src={searchIcon} alt="search" />
            </button>
        </div>
    );
}

export default TopNavbar;