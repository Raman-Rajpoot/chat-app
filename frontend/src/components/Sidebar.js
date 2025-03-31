import React, { use, useEffect, useState,  } from 'react';
import { useNavigate } from "react-router";
import './Sidebar.css';
import { useDispatch, useSelector } from "react-redux";
import { updateFriendData } from '../redux/features/friend.feature.js';
import chatAPI from '../api/chat.api.js';




// Function to generate user initials from a name string

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
  const navigate =useNavigate()
  const dispatch = useDispatch();
  const friendData = useSelector((state) => state.friendData);
  
  // Use friendData (an array of chat objects) as the source of users
  // and filter based on chatName
  const filteredUsers = friendData.filter(user =>
    user.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );
 

  


  const getChat = async () => {
    try {
      const response = await chatAPI.get('/get-mychat', { withCredentials: true });
      console.log("users : ", response.data.chats);
      if(response?.data) {
        dispatch(updateFriendData(response.data.chats));
      } else {
        console.error(response?.message);
      }
      console.log(friendData);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getChat();
  }, [dispatch]);

  useEffect(() => {
    console.log("friendData updated: ", friendData);
  }, [friendData]);
 

  const updateChatRoute = async (chatId)=>{
      navigate(`chat/${chatId}`)  
  }

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
          filteredUsers.map((user) => (
            <div 
              key={user._id} 
              className={`chat-item ${activeUser === user._id ? 'active' : ''}`}
              onClick={() => {setActiveUser(user._id);
                updateChatRoute(user._id);
              }} 
            >
              <div className="avatar-container">
                {/* Conditional avatar rendering */}
                {false ? ( // Change condition to check for an existing avatar if available
                  <img
                    src="/images/user-icon.webp"
                    alt="User Avatar"
                    className="user-avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(user.chatName)}
                  </div>
                )}
                <div className="online-status"></div>
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.chatName}</h3>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
