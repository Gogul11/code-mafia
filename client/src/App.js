import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import Temp from './pages/Temp.jsx';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage isLoggedIn={false} />} />
      <Route path='/editor' element={<EditorPage />} />
      <Route path='/temp' element={<Temp />} />
    </Routes> 
    </BrowserRouter>
  );
}

export default App;
