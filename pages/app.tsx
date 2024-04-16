// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import CreateAssistant from './CreateAssistant';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-assistant" element={<CreateAssistant />} />
      </Routes>
    </Router>
  );
}

export default App;