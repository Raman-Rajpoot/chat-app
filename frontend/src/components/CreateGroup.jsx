import React, { useState, useEffect } from 'react';
import './CreateGroup.css';
import userAPI from '../api/user.api.js';
import { useSelector } from 'react-redux';
import chatAPI from '../api/chat.api.js';

function CreateGroup({ isOpen, onClose }) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const userData = useSelector((state) => state.userData);

  const getFriends = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.get('/get-my-friends', {
        withCredentials: true
      });
      console.log(response)
      setFriends(response.data?.friends || []);
      console.log(response.data?.friends)
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      getFriends();
      setSelectedFriends([]);
      setGroupName('');
    }
  }, [isOpen]);

  const handleToggleFriend = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f._id === friend._id);
      return isSelected 
        ? prev.filter(f => f._id !== friend._id)
        : [...prev, friend];
    });
  };

  const handleCreateGroup = async () => {
    try {
      await chatAPI.post('/new/group', {
        chatName: groupName,
        participants: selectedFriends.map(f => f._id)
      }, { withCredentials: true });
      
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="group-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path fill="#00ff88" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="group-header">
          <h2>Create New Group</h2>
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="group-name-input"
          />
        </div>

        <div className="search-section">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="search-icon" viewBox="0 0 24 24">
              <path fill="#00ff88" d="M9.5 3A6.5 6.5 0 0 1 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3M9.5 5C7 5 5 7 5 9.5C5 12 7 14 9.5 14C12 14 14 12 14 9.5C14 7 12 5 9.5 5Z" />
            </svg>
          </div>
        </div>

        <div className="friends-list-container">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            friends
              .filter(f => 
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((friend) => {
                const isSelected = selectedFriends.some(f => f._id === friend._id);
                return (
                  <div 
                    key={friend._id} 
                    className={`friend-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="friend-info">
                      <div className="friend-avatar">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="friend-details">
                        <h3>{friend.name}</h3>
                        <p>{friend.email}</p>
                      </div>
                    </div>
                    <button
                      className={`action-btn-add-member ${isSelected ? 'remove' : 'add'}`}
                      onClick={() => handleToggleFriend(friend)}
                    >
                      {isSelected ? '-' : '+'}
                    </button>
                  </div>
                );
              })
          )}
        </div>

        <button 
          className="create-group-btn"
          onClick={handleCreateGroup}
          disabled={!groupName || selectedFriends.length < 2}
        >
          Create Group
        </button>
      </div>
    </div>
  );
}

export default CreateGroup;