'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function UserSettingsPage() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  const changeRole = async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr><th>Email</th><th>Role</th><th>Action</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => changeRole(u.id, u.role === 'ADMIN' ? 'OPERATOR' : 'ADMIN')}>
                  Switch to {u.role === 'ADMIN' ? 'OPERATOR' : 'ADMIN'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}