import React, { lazy } from 'react';
import './App.css';
import Sidebar from './components/Sidebar.js'
import NormalChatWindow from './components/NormalChatWindow.js';
import Navbar from './components/Navbar.js';
import CollabChatWindow from './components/CollabChatWindow.js';
import Login from './components/Login.js';
 


function App() {
  return (
    <div className="app">
      <div className="app__body">
        {/* <Login /> */}
          <Navbar /> 
        <Sidebar />
        <NormalChatWindow />  
        {/* <CollabChatWindow /> */}
      </div>
    </div>
  );
}

export default App;
