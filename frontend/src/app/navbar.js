"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const clientIds = ['1', '2', '3']; // Example client IDs, replace with real data if available

export default function Navbar() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  return (
    <nav style={{
      display: 'flex',
      gap: '2rem',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb',
      background: 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)',
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '1.1rem',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <Link href="/" style={{ fontWeight: 'bold', color: '#222', textDecoration: 'none' }}>Home</Link>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <Link href="/dashboard" style={{ fontWeight: 'bold', color: '#222', textDecoration: 'none' }}>Dashboard</Link>
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          position: 'absolute',
          left: 0,
          top: '2rem',
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          minWidth: '160px',
          visibility: 'hidden',
          opacity: 0,
          transition: 'all 0.2s',
          pointerEvents: 'none'
        }} className="dashboard-dropdown">
          <Link href="/dashboard/clients" style={{ padding: '0.75rem 1rem', color: pathname.startsWith('/dashboard/clients') ? '#2563eb' : '#222', textDecoration: 'none', fontWeight: pathname.startsWith('/dashboard/clients') ? 'bold' : 'normal' }}>Clients</Link>
          <div style={{ paddingLeft: '1.5rem' }}>
            {clientIds.map(cid => (
              <Link key={cid} href={`/dashboard/clients/${cid}`} style={{ padding: '0.5rem 1rem', color: pathname === `/dashboard/clients/${cid}` ? '#2563eb' : '#444', textDecoration: 'none', fontSize: '0.98rem', display: 'block', fontWeight: pathname === `/dashboard/clients/${cid}` ? 'bold' : 'normal' }}>Client {cid}</Link>
            ))}
          </div>
          <Link href="/dashboard/settings" style={{ padding: '0.75rem 1rem', color: pathname.startsWith('/dashboard/settings') ? '#2563eb' : '#222', textDecoration: 'none', fontWeight: pathname.startsWith('/dashboard/settings') ? 'bold' : 'normal' }}>Settings</Link>
          <div style={{ paddingLeft: '1.5rem' }}>
            <Link href="/dashboard/settings/users" style={{ padding: '0.5rem 1rem', color: pathname === '/dashboard/settings/users' ? '#2563eb' : '#444', textDecoration: 'none', fontSize: '0.98rem', display: 'block', fontWeight: pathname === '/dashboard/settings/users' ? 'bold' : 'normal' }}>Users</Link>
          </div>
        </div>
      </div>
      <Link href="/login" style={{ color: '#222', textDecoration: 'none' }}>Login</Link>
      <Link href="/tasks" style={{ color: '#222', textDecoration: 'none' }}>Tasks</Link>
      <style>{`
        nav > div:hover .dashboard-dropdown {
          visibility: visible;
          opacity: 1;
          pointer-events: auto;
        }
        nav a:hover {
          color: #2563eb;
        }
      `}</style>
    </nav>
  );
}
