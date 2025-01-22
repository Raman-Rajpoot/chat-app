import React, { useState } from 'react';
import './Message.css';

function Message({ user, text, time }) {
  const [status, setStatus] = useState('sent')
  return (
    <div className={`message ${user === "You" ? "message__sender" : ""}`}>
      <p><strong>{user}:
        
        </strong> {text}</p>
      <div className='message-metadata'>
        <p className='message-status'>{status}</p>
      <p className='message-send-time'>{time}</p>
      </div>
    </div>
  );
}

export default Message;
