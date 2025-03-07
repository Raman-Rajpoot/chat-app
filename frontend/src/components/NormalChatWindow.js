import React, { useState, useEffect, useRef } from 'react';
import './NormalChatWindow.css';
import Message from './Message';
import TopNavbar from './TopNavbar';

function NormalChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { text: input, user: "You", timestamp: new Date() }]);
    setInput("");
  };

  return (
    <div className="NormalchatWindow">
      <TopNavbar />
      <div className="NormalchatWindow__body">
        {messages.map((msg, index) => (
          <Message 
            key={index} 
            user={msg.user} 
            text={msg.text} 
            time={msg.timestamp.toLocaleTimeString()} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="NormalchatWindow__footer">
        <form onSubmit={sendMessage} className="message-form">
          <div className="input-container">
            <input 
              type="text" 
              placeholder="Type a message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='chat-box'
            />
            <button type="submit" className="send-button">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NormalChatWindow;