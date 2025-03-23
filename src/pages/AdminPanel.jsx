import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminPanel = ({ user, onLogout, token }) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [selectAll, setSelectAll] = useState(false);
    const [redirectToRegister, setRedirectToRegister] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await axios.get('https://user-management-back-production-6bfb.up.railway.app/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (redirectToRegister) {
        return <Navigate to="/register" />;
    }

    const handleLogout = () => {
        onLogout();
    };

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        const newSelectedUsers = newSelectAll ? Object.fromEntries(users.map(u => [u.id, true])) : {};
        setSelectedUsers(newSelectedUsers);
    };

    const toggleSelectUser = (userId) => {
        setSelectedUsers(prev => {
            const newSelectedUsers = { ...prev };
            newSelectedUsers[userId] ? delete newSelectedUsers[userId] : newSelectedUsers[userId] = true;
            setSelectAll(Object.keys(newSelectedUsers).length === users.length);
            return newSelectedUsers;
        });
    };

    const getSelectedUserIds = () => Object.keys(selectedUsers);

    const handleUserAction = async (endpoint) => {
        const selectedIds = getSelectedUserIds();
        if (selectedIds.length === 0) return;

        try {
            await axios.put(`https://user-management-back-production-6bfb.up.railway.app/users/${endpoint}`, { userIds: selectedIds }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (selectedIds.includes(user.id.toString()) && endpoint === 'block') {
                handleLogout();
                setRedirectToRegister(true);
                return;
            }

            await fetchUsers();
            setSelectedUsers({});
            setSelectAll(false);
        } catch (err) {
            console.error('Error updating users:', err);
            alert(err.response?.data?.message || 'An error occurred');
        }
    };

    const handleDeleteUsers = async () => {
        const selectedIds = getSelectedUserIds();
        if (selectedIds.length === 0) return;

        const confirmDelete = window.confirm("Are you sure you want to delete these users? This action cannot be undone.");
        if (!confirmDelete) return;

        try {
            await axios.delete('https://user-management-back-production-6bfb.up.railway.app/users/delete', {
                data: { userIds: selectedIds },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (selectedIds.includes(user.id.toString())) {
                handleLogout();
                setRedirectToRegister(true);
                return;
            }

            await fetchUsers();
            setSelectedUsers({});
            setSelectAll(false);
        } catch (err) {
            console.error('Error deleting users:', err);
            alert(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <span className="navbar-brand">User Management</span>
                    <div className="d-flex align-items-center">
                        <span className="text-light me-3">Welcome, {user.name}</span>
                        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                <div className="card mb-4">
                    <div className="card-body d-flex gap-2">
                        <button className="btn btn-danger" onClick={() => handleUserAction('block')} disabled={getSelectedUserIds().length === 0}>
                            Block
                        </button>
                        <button className="btn btn-success" onClick={() => handleUserAction('unblock')} disabled={getSelectedUserIds().length === 0}>
                            Unblock
                        </button>
                        <button className="btn btn-warning" onClick={handleDeleteUsers} disabled={getSelectedUserIds().length === 0}>
                            Delete
                        </button>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th className="ps-3" style={{ width: "50px" }}>
                                        <input className="form-check-input" type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
                                    </th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map(userItem => (
                                    <tr key={userItem.id} className={userItem.status === 'blocked' ? 'user-blocked' : ''}>
                                        <td className="ps-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={!!selectedUsers[userItem.id]}
                                                onChange={() => toggleSelectUser(userItem.id)}
                                            />
                                        </td>
                                        <td>{userItem.name}{userItem.id === user.id ? ' (You)' : ''}</td>
                                        <td>{userItem.email}</td>
                                        <td>
                                            <span className={`status-badge ${userItem.status}`}>{userItem.status}</span>
                                        </td>
                                        <td>{userItem.lastLogin ? new Date(userItem.lastLogin).toLocaleString() : 'Never'}</td>
                                    </tr>
                                ))}
                                {users.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No users found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;