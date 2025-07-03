"use client";
import React, { useEffect, useState } from "react";

import { useClientStore, useSocketRealtime } from '@/lib/realtimeStore';
import api from '@/lib/api';

// Dashboard stats page
export default function StatsPage() {
  useSocketRealtime(); // Ensure real-time hydration
  const clients = useClientStore((s) => s.clients) || [];

  // Top 5 clients with highest uptime (if available)
  const topClients = [...clients]
    .filter(c => typeof c.uptime === 'number')
    .sort((a, b) => (b.uptime ?? 0) - (a.uptime ?? 0))
    .slice(0, 5);

  // Stats for total, online, and offline clients
  const totalClients = clients.length;
  const onlineClients = clients.filter(c => c.status === 'online').length;
  const offlineClients = clients.filter(c => c.status === 'offline').length;

  // User login stats state
  const [loginStats, setLoginStats] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoadingStats(true);
    api.get('/login-stats')
      .then(res => {
        if (mounted) setLoginStats(res.data.events || []);
      })
      .catch(() => {
        if (mounted) setStatsError("Failed to load login stats");
      })
      .finally(() => {
        if (mounted) setLoadingStats(false);
      });

    // Real-time socket.io subscription
    const { default: socket } = require('@/lib/socket');
    function handleLoginStatsUpdate(event: any) {
      setLoginStats(prev => [event, ...prev].slice(0, 20));
    }
    socket.on('login_stats_updated', handleLoginStatsUpdate);

    return () => {
      mounted = false;
      socket.off('login_stats_updated', handleLoginStatsUpdate);
    };
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">📊 Client & User Stats Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">Top 5 Clients by Uptime</h2>
          <ol className="list-decimal ml-6">
            {topClients.length === 0 ? (
              <li className="text-gray-500">No clients with uptime data.</li>
            ) : (
              topClients.map((c, i) => (
                <li key={c.id || i} className="mb-2">
                  <span className="font-mono font-semibold">{c.hostname || c.id || 'Unknown'}</span>
                  <span className="ml-2 text-gray-400">Uptime: {c.uptime} s</span>
                </li>
              ))
            )}
          </ol>
        </div>
        <div className="bg-gray-900 rounded-lg shadow p-6 flex flex-col gap-4 justify-between">
          <h2 className="text-xl font-bold mb-4 text-blue-400">Client Summary</h2>
          <ul className="space-y-2">
            <li>Total Clients: <span className="font-mono font-semibold">{totalClients}</span></li>
            <li>Online Clients: <span className="font-mono text-green-400">{onlineClients}</span></li>
            <li>Offline Clients: <span className="font-mono text-red-400">{offlineClients}</span></li>
          </ul>
        </div>
      </div>

      {/* User Stats Section */}
      <div className="bg-gray-900 rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-bold mb-4 text-yellow-400">User Stats (Recent Logins)</h2>
        {loadingStats ? (
          <div className="text-gray-400">Loading login stats...</div>
        ) : statsError ? (
          <div className="text-red-400">{statsError}</div>
        ) : loginStats.length === 0 ? (
          <div className="text-gray-500">No recent login events.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-gray-300 bg-gray-800">
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">IP</th>
                  <th className="px-3 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {loginStats.slice(0, 10).map((ev, i) => (
                  <tr key={ev.id || i} className="border-b border-gray-700">
                    <td className="px-3 py-2 font-mono">{ev.email}</td>
                    <td className={`px-3 py-2 font-semibold ${ev.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{ev.status}</td>
                    <td className="px-3 py-2">{ev.ip || '-'}</td>
                    <td className="px-3 py-2 text-xs">{new Date(ev.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
