import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [activeItem, setActiveItem] = useState('chat');
  
  const navItems = [
    { id: 'chat', icon: 'M12 2.042c-6.627 0-12 4.064-12 9.074 0 2.569 1.24 4.888 3.23 6.479-.178.49-.695 1.773-.742 1.989-.056.26.023.416.168.516.135.095.38.163.627.163.299 0 .582-.094.846-.273 1.115-.781 1.729-1.403 2.346-1.73.838.216 1.733.326 2.67.326 6.627 0 12-4.064 12-9.074s-5.373-9.074-12-9.074z', tooltip: 'Chats' },
    { id: 'status', icon: 'M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z', tooltip: 'Status' },
    { id: 'calls', icon: 'M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z', tooltip: 'Calls' },
    { id: 'group', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05.02.01.03.03.04.04 1.14.83 1.93 1.94 1.93 3.41V18c0 .35-.07.69-.18 1H22c.55 0 1-.45 1-1v-1.5c0-2.33-4.67-3.5-7-3.5z', tooltip: 'New Group' },
    { id: 'archive', icon: 'M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z', tooltip: 'Archive' }
  ];

  return (
    <div className='navbar'>
      {navItems.map((item) => (
        <div 
          key={item.id}
          className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
          onClick={() => setActiveItem(item.id)}
          title={item.tooltip}
        >
          <svg className="nav-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d={item.icon} />
          </svg>
        </div>
      ))}
    </div>
  )
}

export default Navbar;