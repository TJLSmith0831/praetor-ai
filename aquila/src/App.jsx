import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage/LandingPage';
import RegisterPage from './LandingPage/RegisterPage';
import TaskManager from './TaskManager/TaskManager';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/taskmanager" element={<TaskManager />} /> */
      </Routes>
    </BrowserRouter>
  );
};

export default App;
