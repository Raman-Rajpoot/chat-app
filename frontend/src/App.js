import React, { lazy } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.js'
import NormalChatWindow from './components/NormalChatWindow.js';
import Navbar from './components/Navbar.js';
import CollabChatWindow from './components/CollabChatWindow.js';
import Login from './components/Login.js';
import TopNavbar from './components/TopNavbar.js';
import UserProfile from './components/UserProfile.jsx';
 


function App() {
  return (
   
    // <div className="app">
    //    <div className="app__body"> 
      
    //      <Navbar />  
    //      <Sidebar /> 
    //      <NormalChatWindow />   
    //    <UserProfile />
    //  </div> 
      <Login/>
    // </div>
  );
}

export default App;
