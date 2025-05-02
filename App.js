import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom'; // Importing necessary components from react-router-dom
import Login from './Login';  // Ensure you are importing Login.js
import Dashboard from './Dashboard';  // Ensure you are importing Dashboard.js

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true); // Mark as logged in
  };

  return (
    <Router>
      <Routes>
        {/* Route for login page */}
        <Route 
          path="/" 
          element={<Login onLogin={handleLogin} />} 
        />
        
        {/* Route for dashboard page */}
        <Route 
          path="/dashboard" 
          element={loggedIn ? <Dashboard /> : <Login onLogin={handleLogin} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
