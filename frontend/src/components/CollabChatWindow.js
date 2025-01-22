import React, { useEffect, useState } from 'react'
import TopNavbar from './TopNavbar';
import './CollabChatWindow.css'
function CollabChatWindow() {
    const [fullWindow,setFullWindow] = useState(false);

   
  return (
    <div className='CollabChatWindow'>
       {!fullWindow ?  <TopNavbar />:"" }
        <div onClick={()=>{
            setFullWindow(!fullWindow);
        }} className={fullWindow? "fullWindow widthBar": "window widthBar"}>{fullWindow ? 'Full': 'Normal' }</div>
    </div>
  )
}

export default CollabChatWindow