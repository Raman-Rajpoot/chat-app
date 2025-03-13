import React, { useState, useEffect } from 'react';
import './Notification.css';
import userAPI from '../api/user.api.js';
import { useDispatch, useSelector } from 'react-redux';

function Notification({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userData = useSelector((state) => state.userData);

  // Fetch notifications
  const getNotifications = async () => {
    try {
      const response = await userAPI.get('/get-notifications', {
        withCredentials: true,
      });
      console.log(response)
      if (response.data?.requests) {
        setNotifications(response.data.requests);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setIsLoading(false);
    }
  };

  // Handle friend request response
  const handleFriendRequest = async (requestId, action) => {
    try {
      await userAPI.post(
        `/accept-friend-request`,
        { requestId , action},
        { withCredentials: true }
      );
      // Remove the handled notification
      setNotifications(prev => prev.filter(n => n._id !== requestId));
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path fill="#00ff88" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="notifications-header">
          <h2>Friend Requests</h2>
          <div className="notification-count">
            {notifications.length} Pending
          </div>
        </div>

        <div className="notifications-container">
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div 
                key={notification._id} 
                className="notification-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="user-info">
                  <div className="user-avatar">
                    {notification?.sender?.avatar || 
                     notification?.sender?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="user-details">
                    <h3>{notification?.sender?.name}</h3>
                    <p>{notification?.sender?.email}</p>
                    <span className="request-time">
                      {new Date(notification?.createdAt)?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="action-buttons">
                  <button 
                    className="accept-btn"
                    onClick={() => handleFriendRequest(notification._id, 'accept')}
                  >
                    Accept
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59 21 7z"/>
                    </svg>
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleFriendRequest(notification._id, 'reject')}
                  >
                    Reject
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24">
                <path fill="#666" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p>No pending requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notification;