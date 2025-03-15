import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ChatDetails.css";
import chatAPI from "../api/chat.api";
import { useSelector } from "react-redux";

function ChatDetails() {
  const { chatId } = useParams(); // Get chatId from URL
  const [chatData, setChatData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
 const userData = useSelector((state) => state.userData);

  const [isAdmin,setAdmin] = useState(false)

  // Fetch Chat Details when chatId changes
  useEffect(() => {
    if (chatId) {
      getChatDetails();
    }
  }, [chatId, userData]);

  // Fetch Chat Data
  const getChatDetails = async () => {
    try {
      console.log("Fetching chat for chatId:", chatId);
      const response = await chatAPI.get(`/get-chatInfo/${chatId}`, {
        withCredentials: true,
      });

      if (response.data) {
        console.log("Chat Data:", response.data);
        setChatData(response.data.data);
        setEditedName(response.data.data.name);
        setEditedBio(response.data.data.bio);
        //  const userData = useSelector((state) => state.userData);
        console.log(chatData?.creator, userData._id)
        setAdmin(response.data?.data?.creator == userData?._id);
        console.log(userData, isAdmin)
      } else {
        console.log("No response data");
      }
    } catch (err) {
      console.error("Error fetching chat details:", err);
    }
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSaveChanges = () => {
    // Add API call to save changes
    setIsEditing(false);
  };

  if (!chatData) {
    return <div>Loading chat details...</div>;
  }

  return (
    <div className="chat-detail-container scroller">
      {/* Header Section */}
      <div className="chat-detail-header">
        <div className="chat-detail-avatar animate-pop">
          {chatData?.isGroupChat ? "👥" : "👤"}
        </div>
        <div className="chat-detail-meta">
          {isEditing ? (
            <>
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="chat-detail-edit-input"
              />
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="chat-detail-edit-textarea"
              />
            </>
          ) : (
            <>
              <h1 className="animate-slide-up">{chatData?.chatName}</h1>
              <p className="chat-detail-bio animate-fade-in">{chatData?.bio}</p>
            </>
          )}
        </div>
      </div>

      {/* Admin Controls */}
      {chatData?.isGroupChat && isAdmin && (
        <div className="chat-detail-admin-controls animate-slide-up">
          <button onClick={handleEditToggle} className="chat-detail-edit-btn">
            {isEditing ? "Cancel" : "Edit Group"}
          </button>
          {isEditing && (
            <button onClick={handleSaveChanges} className="chat-detail-save-btn">
              Save Changes
            </button>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="chat-detail-info-section animate-fade-in">
        <div className="chat-detail-info-card">
          <h3>Group Details</h3>
          <div className="info-row">
            <span>Created:</span>
            <span>
              {new Date(chatData?.createdAt)?.toLocaleDateString()}
            </span>
          </div>
          <div className="info-row">
            <span>Creator:</span>
            <span>
              {chatData?.members.find((m) => m._id === chatData?.creator)?.name}
            </span>
          </div>
          <div className="info-row">
            <span>Members:</span>
            <span>{chatData?.members?.length}</span>
          </div>
        </div>
      </div>

      {/* Members List */}
      {chatData?.isGroupChat && (
        <div className="chat-detail-members-list animate-slide-up">
          <h3>Members</h3>
          {chatData?.members.map((member, index) => (
            <div
              key={member?._id}
              className="member-card animate-pop"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="member-avatar">
                {member?.avatar.url || member?.name.charAt(0)}
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p>{member.email}</p>
                {member?._id === chatData?.creator && (
                  <span className="admin-badge">Admin</span>
                )}
              </div>
              {isAdmin && member?._id !== userData._id && (
                <button
                  onClick={() => console.log("Removing member...")}
                  className="remove-member-btn"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="chat-detail-action-buttons animate-fade-in">
        {chatData?.isGroupChat ? (
          <>
            <button
              onClick={() => console.log("Leaving group...")}
              className="action-btn danger"
            >
              Leave Group
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => console.log("Deleting group...")}
                  className="action-btn danger"
                >
                  Delete Group
                </button>
                <button
                  onClick={() => console.log("Adding member...")}
                  className="action-btn primary"
                >
                  Add Member
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => console.log("Deleting chat...")}
              className="action-btn danger"
            >
              Delete Chat
            </button>
            <button
              onClick={() => console.log("Removing friend...")}
              className="action-btn danger"
            >
              Remove Friend
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatDetails;
