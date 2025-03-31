import React, { useState } from 'react';
import './Message.css';
import { useSelector } from 'react-redux';
import chatAPI from '../api/chat.api';

function Message({ sender_id,sender_name, text, time, onDelete }) {
  const [status, setStatus] = useState('sent');
  const [isHovered, setIsHovered] = useState(false);
  const user = useSelector((state) => state.userData);

 

  return (
    <div 
      className={`message-container ${sender_id === user._id ? "message__sender" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Delete Icon (left side) */}
      {sender_id === user._id && (
        <div 
          className={`delete-icon ${isHovered ? 'visible' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path 
              fill="currentColor" 
              d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" 
            />
          </svg>
        </div>
      )}

      <div className={`message ${isHovered ? 'shifted' : ''}`}>
        <p className="message-text">
          <strong>{sender_name}:</strong> {text}
        </p>
        <div className="message-metadata">
          <p className="message-status">{status}</p>
          <p className="message-send-time">{time}</p>
        </div>
      </div>
    </div>
  );
}

export default Message;