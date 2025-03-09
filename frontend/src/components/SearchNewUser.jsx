import React, { useState, useEffect } from 'react';
import './SearchNewUser.css';
import userAPI from '../api/user.api.js'


import { useDispatch, useSelector } from "react-redux";
import { updateFriendData } from '../redux/features/friend.feature.js';

function SearchNewUser({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(null);
  const [addedFriends, setAddedFriends] = useState(new Set());
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const friendData = useSelector((state) => state.friendData);

// Corrected API call with GET parameters
const searchUsers = async (searchQuery) => {
    try{
        const response = await userAPI.get('/search/alluser',{
            params : {search : searchQuery}
        });
        console.log(response)
        if(response.data){
            
            console.log(users);
            return response?.data;
        }
    } catch(err){
        setError("error occurs during search")
    //    throw err;
      return ;
    }
};
  
  // Usage in useEffect
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim()) {
        const results = await searchUsers(searchQuery);
        setUsers(results?.user);
      }
    }, 300);
  
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

 

  const handleAddFriend = (userId) => {
    setAddedFriends(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path fill="#00ff88" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
        
        <div className="search-header">
          <h2>Search Users</h2>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path fill="#00ff88" d="M9.5 3A6.5 6.5 0 0 1 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3M9.5 5C7 5 5 7 5 9.5C5 12 7 14 9.5 14C12 14 14 12 14 9.5C14 7 12 5 9.5 5Z"/>
            </svg>
          </div>
        </div>

        <div className="results-container">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : users?.length > 0 ? (
            users.map((user) => (
               
              <div 
                key={user._id} 
                className="user-card"
                style={{ animationDelay: `${user._id * 0.1}s` }}
              >
                <div className="user-info-search">
                  <div className="result-avatar">
                    {user.avatar.url || user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>
            <button
  className={`add-friend-btn ${addedFriends.has(user._id) ? 'added' : ''}`}
  onClick={() => handleAddFriend(user._id)}
  onMouseEnter={() => setTooltipVisible(user._id)}
  onMouseLeave={() => setTooltipVisible(null)}
>
  <svg className="plus-icon" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
  
  <svg className="minus-icon" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
  </svg>

  {tooltipVisible === user._id && (
    <span className="tooltip">
      {addedFriends.has(user._id) ? 'Remove Friend' : 'Add Friend'}
    </span>
  )}
</button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24">
                <path fill="#666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchNewUser;