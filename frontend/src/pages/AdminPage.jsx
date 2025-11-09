import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

export default function AdminPage(){
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
  api.interceptors.request.use(cfg=>{ if(token) cfg.headers.Authorization = `Bearer ${token}`; return cfg; });

  async function load(){
    setLoading(true); setError(null);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch(e){
      setError('Failed to load users');
    } finally { setLoading(false); }
  }

  async function changeRole(id, action){
    try {
      const res = await api.post(`/admin/users/${id}/${action}`);
      setUsers(users.map(u=> u._id===id ? { ...u, role: res.data.role } : u));
    } catch(e){
      alert('Role change failed');
    }
  }

  useEffect(()=>{ load(); },[]);

  return (
    <div>
      <h1 className='text-2xl font-bold mb-4'>Admin</h1>
      {loading && <div>Loading...</div>}
      {error && <div className='text-red-600 text-sm'>{error}</div>}
      <table className='w-full text-sm border border-slate-300 dark:border-slate-600'>
        <thead className='bg-slate-100 dark:bg-slate-700'>
          <tr>
            <th className='p-2 text-left'>Email</th>
            <th className='p-2 text-left'>Display Name</th>
            <th className='p-2 text-left'>Currency</th>
            <th className='p-2 text-left'>Role</th>
            <th className='p-2 text-left'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u=> (
            <tr key={u._id} className='border-t border-slate-200 dark:border-slate-700'>
              <td className='p-2'>{u.email}</td>
              <td className='p-2'>{u.displayName || ''}</td>
              <td className='p-2'>{u.preferences?.currency || 'HUF'}</td>
              <td className='p-2'>{u.role}</td>
              <td className='p-2 space-x-2'>
                {u.role !== 'Administrator' && (
                  <button onClick={()=>changeRole(u._id,'promote')} className='px-2 py-1 text-xs bg-blue-600 text-white rounded'>Promote</button>
                )}
                {u.role === 'Administrator' && (
                  <button onClick={()=>changeRole(u._id,'demote')} className='px-2 py-1 text-xs bg-yellow-600 text-white rounded'>Demote</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
