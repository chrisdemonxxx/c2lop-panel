"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoginPage from './login/page';

export default function Index() {
  const [checking, setChecking] = useState(true);
  const [noAdmin, setNoAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await api.get('/auth/admin-exists');
        if (!res.data.exists) {
          setNoAdmin(true);
          router.replace('/register');
        }
      } catch {
        setNoAdmin(true);
        router.replace('/register');
      } finally {
        setChecking(false);
      }
    }
    checkAdmin();
  }, [router]);

  if (checking || noAdmin) return null;
  return <LoginPage />;
}
