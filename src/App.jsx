import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import axios from 'axios';
import './App.css';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); //

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('Checking token:', token);

            if (!token) {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('https://user-management-back-production-6bfb.up.railway.app/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('User authenticated:', response.data);
                setIsAuthenticated(true);
                setCurrentUser(response.data);
            } catch {
                console.log('Authentication failed');
                setIsAuthenticated(false);
                setCurrentUser(null);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = (token, user) => {
        console.log('Saving token:', token);
        console.log('User:', user);

        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setCurrentUser(user);
        navigate('/admin');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUser(null);
        navigate('/login');
    };

    const ProtectedRoute = ({ children }) => {
        console.log('Auth status:', isAuthenticated, 'Loading:', loading);
        if (loading) return <div>Loading...</div>;
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/login" element={<LoginPage onLogin={handleLogin} isAuthenticated={isAuthenticated} />} />
                    <Route path="/register" element={<RegisterPage onLogin={handleLogin} isAuthenticated={isAuthenticated} />} />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminPanel user={currentUser} onLogout={handleLogout} token={localStorage.getItem('token')} />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to={isAuthenticated ? "/admin" : "/login"} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
