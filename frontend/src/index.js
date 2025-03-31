import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import rootStore from './redux/stores/root.store.js';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    
    <Provider store = {rootStore}>
   
    <App />

    </Provider>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))

