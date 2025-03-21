import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from "./components/AppContent.jsx";

import './App.css';


const App = () => (
    <Router>
        <div className="app-container">
            <AppContent />
        </div>
    </Router>
);

export default App;
