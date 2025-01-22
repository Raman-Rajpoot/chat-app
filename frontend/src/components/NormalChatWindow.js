import React, { useState } from 'react';
import './NormalChatWindow.css';
import Message from './Message';
import TopNavbar from './TopNavbar';

function NormalChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  

  const sendMessage = (e) => {
    e.preventDefault();
    if(!input.trim()) return ;
    setMessages([...messages, { text: input, user: "You" }]);
    setInput("");
  };

  return (
    <div className="NormalchatWindow">
      
      <TopNavbar />
      <div className="NormalchatWindow__body">
        {messages.map((msg, index) => (
          <Message key={index} user={msg.user} text={msg.text} time={Date()} />
        ))}
      </div>
      <div className="NormalchatWindow__footer">
        <form onSubmit={sendMessage}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='chat-box'
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default NormalChatWindow;
