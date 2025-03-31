import React, { useEffect } from 'react';

import { Route, Routes, BrowserRouter as Router ,useNavigate} from 'react-router-dom';
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-tiptap/styles.css";
import './api/globals.css';
// import './App.css';
import NormalChatWindow from './components/NormalChatWindow.js';

import CollabChatWindow from './components/CollabChatWindow.js';
import Login from './components/Login.js';
import Layout from './Layout.jsx';
import { useSelector, useDispatch } from 'react-redux';

import userAPI from '../src/api/user.api.js'
import { updateData } from '../src/redux/features/user.feature.js';
import ChatDetails from './components/ChatDetails.jsx';
import { SocketProvider } from './api/socket.api.js';

const App = () => {
 const dispatch = useDispatch();
 const userData = useSelector((state) => state.userData);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <SocketProvider>
              <Layout />
          </SocketProvider>
        }>
          <Route index element={<NormalChatWindow />} />
          <Route path='/chat/:chatId' element={<NormalChatWindow />} />
          <Route path="collab/:chatId" element={<CollabChatWindow />} />
          <Route path='/chat/info/:chatId' element={<ChatDetails />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
