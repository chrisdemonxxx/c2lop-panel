'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    } catch {
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="bg-gray-900 p-6 rounded shadow w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold">Admin Login</h2>
        {error && <p className="text-red-400">{error}</p>}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="p-2 w-full bg-gray-800 rounded" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="p-2 w-full bg-gray-800 rounded" />
        <button type="submit" className="w-full bg-blue-600 p-2 rounded">Login</button>
      </form>
    </main>
  );
}