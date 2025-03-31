import React, { useEffect, useState, useCallback } from 'react';
import TopNavbar from './TopNavbar';
import './CollabChatWindow.css';
import { useSocket } from '../api/socket.api';
import { COLLABMSG } from '../constants/events';
import chatAPI from '../api/chat.api';
import { useParams } from 'react-router-dom';



import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { Editor } from '../api/Editor.tsx';
import { ClientSideSuspense } from "@liveblocks/react";



function CollabChatWindow() {
  // const [members, setMembers] = useState([]);
  // const { chatId } = useParams();
  // const socket = useSocket();
  // const [content, setContent] = useState('');

  // // Fetch chat details when chatId changes
  // const getChatDetails = useCallback(async () => {
  //   try {
  //     const response = await chatAPI.get(`/get-chats/${chatId}?populate=true`, {
  //       withCredentials: true,
  //     });
  //     if (response.data) {
  //       setMembers(response.data.data.members);
  //     } else {
  //       setMembers([]);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching chat details:", err);
  //   }
  // }, [chatId]);

  // useEffect(() => {
  //   if (chatId) {
  //     getChatDetails();
  //   }
  // }, [chatId, getChatDetails]);

  
  // const handleContentChange = (e) => {
  //   setContent(e.target.value);
  // };

  // useEffect(() => {
  //   if (!socket) return;

  //   const handleIncomingMessage = (msg) => {
  //     setContent(msg.content);
  //     console.log("Received message:", msg);
  //   };

  //   socket.on(COLLABMSG, handleIncomingMessage);
  //   console.log("Socket event listener for COLLABMSG added.");
  //   return () => {
  //     socket.off(COLLABMSG, handleIncomingMessage);
  //   };
  // }, [content, members, chatId, socket]);


  // useEffect(() => {
  //   if (!socket || !chatId) return;
  // const timer = setTimeout(() => {
  //     socket.emit(COLLABMSG, { content, members, chatId });
  //     // console.log("Emitted message with content:", content);
  //   }, 3000); 

  //   return () => {
  //     clearTimeout(timer); 
  //   }
   
  // }, [content, members, chatId, socket]);








  return (
    <div className="collab-chat-window">
      <TopNavbar />
      {/* <textarea
        className="collab-textarea"
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing..."
      /> */}


    <LiveblocksProvider publicApiKey={"pk_dev_3ADcbyoxNkoozWMuuRq36pkwi_bmJmefrl2kioaef5fPlrnTobMoThNZE4Kipwuh"}>
      <RoomProvider id="my-room">
      <ClientSideSuspense fallback={<div>Loading…</div>}>
          <Editor />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
    

    </div>
  );
}

export default CollabChatWindow;
