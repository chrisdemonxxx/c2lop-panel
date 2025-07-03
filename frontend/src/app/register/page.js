"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, password });
      setSuccess('Admin account created! Please log in.');
      setTimeout(() => router.push('/login'), 1500);
    } catch {
      setError('Registration failed.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleRegister} className="bg-gray-900 p-6 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold">Create Admin Account</h2>
        {error && <p className="text-red-400">{error}</p>}
        {success && <p className="text-green-400">{success}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="p-2 w-full bg-gray-800 rounded" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="p-2 w-full bg-gray-800 rounded" />
        <button type="submit" className="w-full bg-blue-600 p-2 rounded">Register</button>
      </form>
    </main>
  );
}
