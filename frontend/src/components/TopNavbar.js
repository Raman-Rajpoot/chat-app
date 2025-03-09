import React, { useState } from 'react';
import './TopNavbar.css';
import searchIcon from "../images/search.png";
import SearchNewUser from './SearchNewUser';
function TopNavbar() {
    const [chatType, setChatType] = useState("Normal");
    const [showSearch, setShowSearch] = useState(false);
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
            <img src={searchIcon} alt="search" onClick={() => setShowSearch(true)} />
            </button>
            {showSearch && <SearchNewUser isOpen={showSearch} onClose={() => setShowSearch(false)} />}
        </div>
    );
}

export default TopNavbar;