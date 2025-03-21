import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminPanel = ({ user, onLogout, token }) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [selectAll, setSelectAll] = useState(false);

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

    if (!user || user.status === 'blocked') {
        return <Navigate to="/login" />;
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

            await fetchUsers();
            setSelectedUsers({});
            setSelectAll(false);
        } catch (err) {
            console.error('Error updating users:', err);
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
                        <button className="btn btn-danger" onClick={() => handleUserAction('block')} disabled={getSelectedUserIds().length === 0}>Block</button>
                        <button className="btn btn-success" onClick={() => handleUserAction('unblock')} disabled={getSelectedUserIds().length === 0}>Unblock</button>
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
                                </tr>
                                </thead>
                                <tbody>
                                {users.map(userItem => (
                                    <tr key={userItem.id} className={userItem.status === 'blocked' ? 'user-blocked' : ''}>
                                        <td className="ps-3">
                                            <input className="form-check-input" type="checkbox"
                                                   checked={!!selectedUsers[userItem.id]}
                                                   onChange={() => toggleSelectUser(userItem.id)}
                                                   disabled={userItem.id === user.id}/>
                                        </td>
                                        <td>{userItem.name}</td>
                                        <td>{userItem.email}</td>
                                        <td><span className={`status-badge ${userItem.status}`}>{userItem.status}</span>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">No users found</td></tr>}
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
