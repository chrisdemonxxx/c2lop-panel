'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ClientSystemPage() {
  const { clientId } = useParams();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api.get(`/clients/${clientId}`).then(res => setInfo(res.data.systemInfo));
  }, [clientId]);

  if (!info) return <div>Loading system info...</div>;

  let parsed;
  try {
    parsed = JSON.parse(info);
  } catch {
    parsed = { error: 'Invalid JSON' };
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>System Information</h2>
      <pre>{JSON.stringify(parsed, null, 2)}</pre>
    </div>
  );
}