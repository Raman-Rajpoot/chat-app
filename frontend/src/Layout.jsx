import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import './App.css'
import UserProfile from './components/UserProfile.jsx';
import userAPI from './api/user.api.js';
import { useDispatch, useSelector } from "react-redux";
import { updateData } from './redux/features/user.feature.js';
import { useSocket } from './api/socket.api.js';

import { useEffect, useState } from "react";
const Layout = () => {
const navigate = useNavigate()
 const dispatch = useDispatch();
 const userData = useSelector((state) => state.userData);

 const socket = useSocket()
console.log(socket.id)
const getUser = async() => {
  try {
    const response = await userAPI.get('/getuser',{ withCredentials: true }); 
   

    if (response.data) {
      dispatch(updateData(response?.data?.user));
      console.log("user : ", response.data.user) 
    } else {
      console.error(response?.message);
      navigate('/login')
    }
  }catch (err) {
    if (err.response?.status === 401) {
      console.warn("User not authenticated. Stay on the same page.");
      navigate('/login')
    } else {
      console.error("Error fetching user data:", err);
      navigate('/login')
    }   
  }
}
 useEffect(()=>{
  getUser();
 }, [dispatch]);

 
  return (
    <div className="app">
       <div className="app__body">
       

      <Navbar />
        <Sidebar />
       
          <Outlet />
       
        <UserProfile />
     
      </div>
    </div>
  );
};

export default Layout;


