import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import PowerUpContainer from './components/powerUpComponents/PowerUpContainer.jsx';
import Temp from './pages/Temp.jsx';

import socket from './socket.js';

socket.onAny((event, ...args) => {
  console.log(event, args);
});

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage isLoggedIn={true} />} />
      <Route path='/editor' element={<EditorPage />} />
      <Route path='/temp' element={<Temp />} />
      <Route path='/power' element={<PowerUpContainer />} />
    </Routes> 
    </BrowserRouter>
  );
}

export default App;
