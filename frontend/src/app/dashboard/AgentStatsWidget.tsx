import React from 'react';
import { useClientStore } from '@/lib/realtimeStore';

function detectOS(hostname: string) {
  const hn = hostname.toLowerCase();
  if (hn.includes('win')) return 'Windows';
  if (hn.includes('linux')) return 'Linux';
  if (hn.includes('mac') || hn.includes('osx')) return 'macOS';
  return 'Other';
}

export default function AgentStatsWidget() {
  const clients = useClientStore((s) => s.clients) || [];
  const osCounts: Record<string, number> = {};
  clients.forEach(c => {
    const os = detectOS(c.hostname || '');
    osCounts[os] = (osCounts[os] || 0) + 1;
  });
  const osList = ['Windows', 'Linux', 'macOS', 'Other'];

  if (clients.length === 0) {
    return <div className="text-blue-400 opacity-60">No agent data yet</div>;
  }

  return (
    <div className="flex gap-8 flex-wrap">
      {osList.map(os => (
        <div key={os} className="flex flex-col items-center">
          <span className="text-xl font-bold text-blue-200">{os}</span>
          <span className="text-blue-400">{osCounts[os] || 0}</span>
        </div>
      ))}
    </div>
  );
}
