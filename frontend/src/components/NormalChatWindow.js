import React, { useState, useEffect, useRef, useCallback } from "react";
import "./NormalChatWindow.css";
import Message from "./Message";
import TopNavbar from "./TopNavbar";
import { useSocket } from "../api/socket.api";
import { NEW_MESSAGE } from "../constants/events.js";
import { useParams } from "react-router-dom";
import chatAPI from "../api/chat.api";
import InfiniteScroll from "react-infinite-scroll-component";

function NormalChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socket = useSocket();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { chatId } = useParams();
  const [members, setMembers] = useState([]);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getChatDetails = async () => {
    try {
      const response = await chatAPI.get(`/get-chats/${chatId}?populate=true`, {
        withCredentials: true,
      });
      if (response.data) {
        setMembers(response.data?.data.members);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("Error fetching chat details:", err);
    }
  };

  useEffect(() => {
    if (!chatId) return;
    getChatDetails();
  }, [chatId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socket.emit(NEW_MESSAGE, { chatId, members, message: input });
    console.log("message : ", input);
    setInput("");
  };

  const fetchOlderMessages = useCallback(async () => {
    if (!hasMore || !chatId) return;
    // console.log("dfasdfasddfsdfsdcfsdfasd")

    try {
      const response = await chatAPI.get(
        `/get-messages/${chatId}?page=${page}`,
        { withCredentials: true }
      );
     console.log(response)
      if (response.data.messages.length > 0) {
        setMessages((prev) => [...prev,...response.data.messages]);
        setPage((prev) => prev + 1);
        // console.log("page : ", page);
        // console.log(response.data.messages.);
        
        if (response.data.messages.length < 10) { // Assuming 10 is your page size
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching older messages:", err);
      setHasMore(false);
    } finally {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [chatId, page, hasMore, isInitialLoad]);

  useEffect(() => {
    if (!chatId) return;
    
    // Reset states when chatId changes
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setIsInitialLoad(true);
    
    // Load initial messages
    fetchOlderMessages();
  }, [chatId]);

  const handleNewMessage = useCallback((msg) => {
    console.log(msg)
    console.log(msg.chat, chatId)
    if (""+ msg.chat == "" +chatId) {
      setMessages((prev) => [ msg,...prev]);
      console.log("message at recieve : ", msg); 
    }
  }, [chatId,setMessages]);

  useEffect(() => {
    if (!socket) return;
    console.log(socket)
    socket.on(NEW_MESSAGE, handleNewMessage);
    return () => {
      socket.off(NEW_MESSAGE, handleNewMessage);
    };
  }, [socket, handleNewMessage]);

  const handleDeleteMessage = async (messageId) => {
    console.log("Deleting message with ID:", messageId);
    try {
      await chatAPI.delete("/delete-message", {
        data: { messageId },
        withCredentials: true,
      });
  
      // Remove message from UI
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  
  return (
    <div className="NormalchatWindow">
      <TopNavbar />
      <div
        id="scrollableDiv"
        ref={containerRef}
        className="NormalchatWindow__body"
        style={{
          height: "400px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        <InfiniteScroll
          dataLength={messages.length}
          next={fetchOlderMessages}
          hasMore={hasMore}
          inverse={true} // Important for chat apps
          loader={<h4>Loading older messages...</h4>}
          scrollableTarget="scrollableDiv"
          style={{ display: 'flex', flexDirection: 'column-reverse' }} // Needed for inverse scroll
        >
          {messages.map((msg, index) => (
            <Message
              key={ index}
              sender_id={msg.sender._id}
              sender_name={msg.sender.name}
              text={msg.content}
              time={`${new Date(msg.createdAt)?.toLocaleTimeString()} ${new Date(msg.createdAt)?.toLocaleDateString()}` }
              onDelete={() => handleDeleteMessage(msg._id)}
            />
          ))}
          {/* <div ref={messagesEndRef} /> */}
        </InfiniteScroll>
      </div>

      <div className="NormalchatWindow__footer">
        <form onSubmit={sendMessage} className="message-form">
          <div className="input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-box"
            />
            <button type="submit" className="send-button">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NormalChatWindow;