import React, { useState, useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import "./ChatDetails.css";
import chatAPI from "../api/chat.api";
import { useSelector } from "react-redux";

function ChatDetails() {
  const { chatId } = useParams();
  const userData = useSelector((state) => state.userData);
  const friendData = useSelector((state) => state.friendData);
  const navigate = useNavigate()
  // State Management
  const [chatData, setChatData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [isAdmin, setAdmin] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  
  // Member Management
  const [isRemoveMember, setIsRemoveMember] = useState(false);
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Derived Data
  const [filteredUsers,setFilteredUsers] = useState([]);
  useEffect(()=>{
    setFilteredUsers(chatData 
    ? (friendData || []).filter(user => 
        !user.isGroupChat && !chatData.members.some(member => 
          "" + member._id === "" + user._id
        ) && 
        "" + user._id !==  "" + userData?._id
      )
    : [])
    console.log("filteredUsers: ",filteredUsers)
  },[chatData,friendData])
  
  // Notification Handler
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 3000);
  };

  // Data Fetching
  useEffect(() => {
    if (chatId) getChatDetails();
  }, [chatId, userData?._id]);

  const getChatDetails = async () => {
    try {
      const response = await chatAPI.get(`/get-chatInfo/${chatId}`, {
        withCredentials: true,
      });

      if (response.data?.data) {
        const data = response.data.data;
        console.log("data: ",data)
        setChatData(data);
        setEditedName(data.name);
        setEditedBio(data.bio);
        setAdmin(data.creator.toString() === userData?._id?.toString());
      }
    } catch (err) {
      console.error("Error fetching chat details:", err);
      showNotification("Error loading chat details", "error");
    }
  };

  // Member Operations
  const handleUserSelect = userId => {
    console.log(userId)
    setSelectedMembers(prev => prev.includes(userId) 
      ? prev.filter(id => id !== userId) 
      : [...prev, userId]
    );
  };

  const removeMember = async memberId => {
    try {
      setIsRemoveMember(true);
      await chatAPI.delete("/remove-members", {
        data: { chatId, member: memberId },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      showNotification("Member removed successfully");
      await getChatDetails();
    } catch (err) {
      showNotification("Failed to remove member", "error");
    } finally {
      setIsRemoveMember(false);
    }
  };

  const addMembers = async () => {
    try {
      setIsAddingMembers(true);
      await chatAPI.put(
        "/add-members",
        { chatId, members: selectedMembers }, 
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        }
      );
      showNotification("Members added successfully");
      setShowAddMemberPopup(false);
      setSelectedMembers([]);
      await getChatDetails();
    } catch (err) {
      showNotification("Failed to add members", "error");
    } finally {
      setIsAddingMembers(false);
    }
  };


  // Leave Group
  const leaveGroup = async ()=>{
      try {
        const response = await chatAPI.delete(`/leave-group/${chatId}`,{withCredentials: true})
        setNotification("you successfully leave group");
        navigate('/')
      } catch (error) {
        setNotification("error during leaving group", 'error')
      }
  }

  // delete group
  const deleteGroup = async ()=>{
    try {
      const response = await chatAPI.delete(`/delete-chat/${chatId}`,{withCredentials: true})
      setNotification("you successfully deleted group");
      navigate('/')
    } catch (error) {
      setNotification("error during leaving group", 'error')
    }
}


  // Group Editing
  const handleSaveChanges = async () => {
    try {
      await chatAPI.put(
        `/chats/${chatId}`,
        { name: editedName, bio: editedBio },
        { withCredentials: true }
      );
      showNotification("Changes saved successfully");
      setIsEditing(false);
      await getChatDetails();
    } catch (err) {
      showNotification("Failed to save changes", "error");
    }
  };

  if (!chatData) return <div className="loading">Loading chat details...</div>;

  return (
    <div className="chat-detail-container scroller">
      {/* Notification System */}
      {notification.message && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="chat-detail-header">
        <div className="chat-detail-avatar animate-pop">
          {chatData.isGroupChat ? "👥" : "👤"}
        </div>
        <div className="chat-detail-meta">
          {isEditing ? (
            <>
              <input
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                className="chat-detail-edit-input"
                placeholder="Group name"
              />
              <textarea
                value={editedBio}
                onChange={e => setEditedBio(e.target.value)}
                className="chat-detail-edit-textarea"
                placeholder="Group description"
              />
            </>
          ) : (
            <>
              <h1 className="animate-slide-up">{chatData.chatName}</h1>
              <p className="chat-detail-bio animate-fade-in">{chatData.bio}</p>
            </>
          )}
        </div>
      </div>

      {/* Admin Controls */}
      {chatData.isGroupChat && isAdmin && (
        <div className="chat-detail-admin-controls animate-slide-up">
          <button onClick={() => setIsEditing(!isEditing)} className="chat-detail-edit-btn">
            {isEditing ? "Cancel" : "Edit Group"}
          </button>
          {isEditing && (
            <button onClick={handleSaveChanges} className="chat-detail-save-btn">
              Save Changes
            </button>
          )}
        </div>
      )}

      {/* Group Info Section */}
      <div className="chat-detail-info-section animate-fade-in">
        <div className="chat-detail-info-card">
          <h3>Group Details</h3>
          <div className="info-row">
            <span>Created:</span>
            <span>{new Date(chatData.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="info-row">
            <span>Creator:</span>
            <span>
              {chatData.members.find(m => m._id === chatData.creator)?.name}
            </span>
          </div>
          <div className="info-row">
            <span>Members:</span>
            <span>{chatData.members.length}</span>
          </div>
        </div>
      </div>

      {/* Members List */}
      {chatData.isGroupChat && (
        <div className="chat-detail-members-list animate-slide-up">
          <h3>Members</h3>
          {chatData.members.map((member, index) => (
            <div
              key={member._id}
              className="member-card animate-pop"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="member-avatar">
                {member.avatar?.url || member.name.charAt(0)}
              </div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p>{member.email}</p>
                {member._id === chatData.creator && (
                  <span className="admin-badge">Admin</span>
                )}
              </div>
              {isAdmin && member._id !== userData._id && (
                <button
                  onClick={() => removeMember(member._id)}
                  className="remove-member-btn"
                  disabled={isRemoveMember}
                >
                  {isRemoveMember ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="chat-detail-action-buttons animate-fade-in">
        {chatData.isGroupChat ? (
          <>
            <button className="action-btn danger" onClick={()=>{leaveGroup()}}>
              Leave Group
            </button>
            {isAdmin && (
              <>
                <button className="action-btn danger" onClick={()=>{deleteGroup()}}>
                  Delete Group
                </button>
                <button
                  onClick={() => setShowAddMemberPopup(true)}
                  className="action-btn primary"
                >
                  Add Member
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button className="action-btn danger">
              Delete Chat
            </button>
            <button className="action-btn danger">
              Remove Friend
            </button>
          </>
        )}
      </div>

      {/* Add Member Popup */}
      {showAddMemberPopup && (
    <div className="add-member-popup animate-fade-in">
    <div className="add-member-overlay" onClick={() => setShowAddMemberPopup(false)} />
    <div className="add-member-content animate-slide-up">
      <div className="add-member-header">
        <h3>Add Members </h3>
        <button
          className="add-member-close"
          onClick={() => setShowAddMemberPopup(false)}
        >
          &times;
        </button>
      </div>

      <div className="add-member-search">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      
      </div>

      <div className="add-member-list scroller">
  {filteredUsers?.length ? (
    filteredUsers.map((user) => {
      const isSelected = selectedMembers.includes(user?.members[0]?._id);
      
      return (
        <div
          key={user._id}
          className={`add-member-user-item ${isSelected ? "selected" : ""}`}
        >
          <div 
            className="add-member-user-main" 
            onClick={() => handleUserSelect(user?.members[0]?._id)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleUserSelect(user._id)}
          >
            <div className="add-member-user-avatar">
              {user.avatar?.url ? (
                <img 
                  src={user.avatar.url} 
                  alt={`${user.chatName}'s avatar`} 
                  loading="lazy"
                />
              ) : (
                <div className="avatar-fallback">
                  {user.chatName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="add-member-user-info">
              <h4 aria-label="User name">{user.chatName}</h4>
              {user.email && <p aria-label="User email">{user.email}</p>}
            </div>
          </div>
          {/* <button
            className={`add-member-toggle ${isSelected ? "remove" : "add"}`}
            onClick={() => handleUserSelect(user._id)}
            aria-label={isSelected ? "Remove user" : "Add user"}
          >
            <span className="toggle-icon">
              {isSelected ? '−' : '+'}
            </span>
          </button> */}
        </div>
      );
    })
  ) : (
    <div className="no-users-found">
      <p>No users found</p>
    </div>
  )}
</div>

      <div className="add-member-footer">
        <button
          className="add-member-cancel"
          onClick={() => setShowAddMemberPopup(false)}
        >
          Cancel
        </button>
        <button
          className="add-member-submit"
          onClick={addMembers}
          disabled={!selectedMembers.length || isAddingMembers}
        >
          {isAddingMembers ? "Adding..." : `Add (${selectedMembers.length})`}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default ChatDetails;