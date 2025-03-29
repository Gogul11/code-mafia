import React, { useState, useEffect } from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import PowerUpContainer from './components/powerUpComponents/PowerUpContainer.jsx';
import Temp from './pages/Temp.jsx';
import LoginPage from './pages/LoginPage.jsx';
import axios from 'axios';

import socket from './socket.js';

socket.onAny((event, ...args) => {
  console.log(event, args);
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.valid) {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Token verification failed');
        }
      }
    };
    verifyToken();
  }, []);

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
      <Route path='/login' element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
      <Route path='/editor' element={<EditorPage />} />
      <Route path='/temp' element={<Temp />} />
      <Route path='/power' element={<PowerUpContainer />} />
    </Routes> 
    </BrowserRouter>
  );
}

export default App;
