import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function Login(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/login', {email,password});
      login(res.data.token);
      navigate('/');
    } catch (e) {
      setError('Login failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border p-2" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border p-2" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="bg-blue-600 text-white px-4 py-2 w-full">Login</button>
      </form>
      <p className="text-sm mt-2">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
    </div>
  );
}
