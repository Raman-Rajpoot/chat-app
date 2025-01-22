import React from 'react';
import './Sidebar.css';

function Sidebar() {
  const users = ['User 1', 'User 2', 'User 3', 'User 4', 'User 5', 'User 6', 'User 7', 'User 8', 'User 9', 'User 10'];

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h2>Chats</h2>
      </div>
      <div className="sidebar__chats user-list">
        {users.map((user, index) => (
          <div key={index} className="sidebar__chat">
            <img
              src="/images/user-icon.webp"  // Corrected Image Path
              alt="User Avatar"
              className="sidebar__chat__avatar"
            />
            <p>{user}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
