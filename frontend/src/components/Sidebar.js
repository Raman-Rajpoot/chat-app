import React, { useState } from 'react';
import './Sidebar.css';

// Function to generate user initials
const getInitials = (name) => {
  const names = name.split(' ');
  return names
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUser, setActiveUser] = useState(null); // Track active user
  const users = ['Alex Smith', 'Emma Johnson', 'Michael Brown', 'Sophia Davis', 'William Wilson', 'Olivia Miller', 'James Taylor', 'Charlotte Anderson', 'Benjamin Thomas', 'Amelia Moore'];

  const filteredUsers = users.filter(user =>
    user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h2 className="sidebar__title">CHATS</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" viewBox="0 0 24 24">
            <path fill="#00ff88" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
        </div>
      </div>

      <div className="sidebar__chats user-list">
        {filteredUsers.length === 0 ? (
          <div className="no-results">No matches found</div>
        ) : (
          filteredUsers.map((user, index) => (
            <div 
              key={index} 
              className={`chat-item ${activeUser === user ? 'active' : ''}`}
              onClick={() => setActiveUser(user)} // Set active user on click
            >
              <div className="avatar-container">
                {/* Conditional avatar rendering */}
                {false ? ( // Change condition to check for avatar existence
                  <img
                    src="/images/user-icon.webp"
                    alt="User Avatar"
                    className="user-avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(user)}
                  </div>
                )}
                <div className="online-status"></div>
              </div>
              <div className="user-info">
                <h3 className="user-name">{user}</h3>
                <p className="last-message">Last message preview...</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;