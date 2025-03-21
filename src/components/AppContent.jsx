import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanel from './pages/AdminPanel';
import axios from 'axios';
import './App.css';

const AppContent = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No token found');

                const response = await axios.get('https://user-management-back-production-6bfb.up.railway.app/users/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setIsAuthenticated(true);
                setCurrentUser(response.data);
            } catch {
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
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setCurrentUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    const ProtectedRoute = ({ children }) => {
        if (loading) return <div>Loading...</div>;
        return isAuthenticated ? children : <Navigate to="/login" />;
    };

    return (
        <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminPanel user={currentUser} onLogout={handleLogout} token={localStorage.getItem('token')} />
                </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/admin" : "/login"} />} />
        </Routes>
    );
};
export default AppContent;