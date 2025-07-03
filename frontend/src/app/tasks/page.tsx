'use client';
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import DataTable from '@/components/DataTable';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import GridListToggle from '@/components/GridListToggle';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    api.get('/tasks').then(res => setTasks(res.data));
  }, []);

  if (!tasks) return <LoadingSkeleton className="h-32 w-full" />;

  const columns = [
    { key: 'client', label: 'Client', sortable: false, render: (t: any) => t.client?.hostname || '-' },
    { key: 'command', label: 'Command', sortable: true },
    { key: 'result', label: 'Status', sortable: true, render: (t: any) => t.result ? '✅ Done' : '⏳ Pending' },
    { key: 'output', label: 'Output', sortable: false, render: (t: any) => t.result?.output?.slice(0, 40) || '-' },
    { key: 'createdAt', label: 'Created', sortable: true, render: (t: any) => new Date(t.createdAt).toLocaleString() },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">📜 Task List</h1>
        <GridListToggle view={view} setView={setView} />
      </div>
      {view === 'list' ? (
        <DataTable columns={columns} data={tasks} pageSize={10} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tasks.map((t: any) => (
            <div key={t.id} className="bg-gray-900 p-4 rounded shadow hover:bg-gray-800 transition">
              <div className="font-bold text-lg mb-2">{t.client?.hostname || '-'}</div>
              <div className="text-sm text-gray-400">Command: {t.command}</div>
              <div className="text-sm">Status: {t.result ? '✅ Done' : '⏳ Pending'}</div>
              <div className="text-xs text-gray-400 truncate">Output: {t.result?.output?.slice(0, 40) || '-'}</div>
              <div className="text-xs">Created: {new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}