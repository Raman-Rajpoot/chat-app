import React, { useState } from 'react'
import './TopNavbar.css'
function TopNavbar() {
    const [chatType, setChatType] = useState("Normal")
  return (
   
   <div className="chatWindow__header">
    <h3 className='chat-person-name'>Chat with User 1</h3>
    <div className='type-of-chat'>
      <div className={chatType=='Normal'? "selected": "not-selected Normal"} onClick={()=>{
        setChatType("Normal")
      }}>Normal</div>
      <div className={chatType=='Collaborative'? "selected": "not-selected Collab"} onClick={()=>{
        setChatType("Collaborative")
      }}
      >Collab </div>
    </div>
    <h3 className='chat-contact-search'>
      <div>Voice Call </div>
      <div>Video Call</div>
      <div>Search </div>
    </h3>
  </div>
  
  )
}

export default TopNavbar