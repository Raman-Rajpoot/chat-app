import React, { useState } from 'react';
import './TopNavbar.css';
import searchIcon from "../images/search.png";
import {useNavigate,  useParams} from "react-router-dom"
import SearchNewUser from './SearchNewUser';


function TopNavbar() {
    const [chatType, setChatType] = useState("Normal");
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);
    const { chatId } = useParams();
    const updateRouteForChatInfo = ()=>{
        console.log(chatId)
        navigate(`/chat/info/${chatId}`)
    }

    return (
        <div className="chatWindow__header">
            <h3 className='chat-person-name' onClick={()=>{updateRouteForChatInfo()}}>Chat with User</h3>
            
            <div className='type-of-chat'>
                <div 
                    className={`chat-type-btn ${chatType === 'Normal' ? 'selected' : ''}`}
                    onClick={() =>{
                        setChatType("Normal")
                        navigate(`/chat/${chatId}`); 
}}
                >
                    Normal
                    <div className="glow-effect"></div>
                </div>
                <div 
                    className={`chat-type-btn ${chatType === 'Collaborative' ? 'selected' : ''}`}
                    onClick={() => {
                    setChatType("Collaborative");
                    navigate(`/collab/${chatId}`);
                    
                    }}
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