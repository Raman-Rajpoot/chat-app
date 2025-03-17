import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faUser, faCog, faRobot, faTimes } from '@fortawesome/free-solid-svg-icons';
import './UserProfile.css';
import { useSelector, useDispatch } from 'react-redux';
import { updateData } from '../redux/features/user.feature';
import userAPI from '../api/user.api';
import { useNavigate } from 'react-router-dom';
const UserProfile = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
     dispatch(updateData((prev) => ({ ...prev, [name]: value })));
  };

  const handleAdminRedirect = () => {
    console.log('Redirecting to admin panel...');
  };
const logOut =async ()=>{
  try{
  const response = await userAPI.post('/logout',{withCredentials: true}) ;

  if(response.data){
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    navigate('/login')
  }
}
catch(error){
  console.error("Logout Error:", error);
  alert("Logout failed. Please try again.");  
}
}
 

  return (
    <>
      <div className="sidebar-profile">
        <div className="profile-section">
          <div className="avatar-container">
            {userData?.avatar?.url ? (
              <img src={userData?.avatar?.url} className="profile-image" alt="Profile" />
            ) : (
              <div className="user-icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
            <div className="edit-icon-container" data-tooltip="Edit Profile">
              <FontAwesomeIcon
                icon={faEdit}
                className="edit-icon"
                onClick={() => setShowEditModal(true)}
              />
            </div>
          </div>

          <div className="user-info-profile">
            <div className="info-item" >
              <label>name</label>
              <h3>{userData?.name}</h3>
            </div>
            <div className="info-item" >
              <label>Email</label>
              <p>{userData?.email}</p>
            </div>
            <div className="info-item" >
              <label>Bio</label>
              <p>{userData?.bio}</p>
            </div>
          </div>

          { (
            <button 
              className="admin-btn" 
              onClick={handleAdminRedirect}
          
            >
              <FontAwesomeIcon icon={faCog} />
              <span>Admin</span>
            </button>
          )}

          <button className="logout-btn" onClick={()=>{logOut()}}>
            Logout
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            <form className="edit-form">
              <input
                type="text"
                name="fullName"
                value={userData?.fullName}
                onChange={handleInputChange}
                placeholder="Full Name"
              />
              <input
                type="email"
                name="email"
                value={userData?.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
              <div className="file-input-container">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      dispatch(updateData(((prev) => ({ ...prev, avatar: URL.createObjectURL(file) }))));
                    }
                  }}
                />
                <label htmlFor="avatar-upload" className="file-upload-label">
                  Choose Profile Picture
                </label>
              </div>
              <button
                type="button"
                className="save-btn"
                onClick={() => setShowEditModal(false)}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chatbot Interface */}
      <div className={`chatbot-container ${chatOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3>Support Bot</h3>
          <button className="close-chat" onClick={() => setChatOpen(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="chat-messages">
          <div className="message bot">
            <span>Hello! How can I help you today?</span>
          </div>
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Type your message..." />
          <button className="send-btn">
            <FontAwesomeIcon icon={faRobot} />
          </button>
        </div>
      </div>

      {/* Chatbot Icon */}
      <div 
        className={`chatbot-icon ${chatOpen ? 'active' : ''}`} 
        onClick={() => setChatOpen(!chatOpen)}
        data-tooltip="Chat Support"
      >
        <FontAwesomeIcon icon={faRobot} />
      </div>
    </>
  );
};

export default UserProfile;