import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function Register(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState(null);

  async function handleSubmit(e){
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + '/auth/register', {email,password});
      login(res.data.token);
      navigate('/');
    } catch (e) {
      setError('Registration failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="w-full border p-2" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border p-2" />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="bg-green-600 text-white px-4 py-2 w-full">Register</button>
      </form>
      <p className="text-sm mt-2">Have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
    </div>
  );
}
