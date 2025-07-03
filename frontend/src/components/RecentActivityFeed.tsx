import React, { useEffect, useState } from 'react';
import socket from '@/lib/socket';

interface ActivityEvent {
  type: string;
  message: string;
  timestamp: Date;
}

const MAX_EVENTS = 25;

const eventLabels: Record<string, string> = {
  login_stats_updated: 'Login',
  client_connected: 'Client Connected',
  client_disconnected: 'Client Disconnected',
  task_created: 'Task Created',
  task_updated: 'Task Updated',
  task_deleted: 'Task Deleted',
};

export default function RecentActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const handleEvent = (type: string, data: any) => {
      let message = '';
      if (type === 'login_stats_updated') {
        message = `User ${data.email} login ${data.status}`;
      } else if (type === 'client_connected' || type === 'client_disconnected') {
        message = `${data.hostname || data.id} (${data.ip || ''})`;
      } else if (type.startsWith('task_')) {
        message = `${data.command || data.id}`;
      } else {
        message = JSON.stringify(data);
      }
      setEvents((prev) => [
        { type, message, timestamp: new Date() },
        ...prev.slice(0, MAX_EVENTS - 1),
      ]);
    };

    socket.on('login_stats_updated', (data) => handleEvent('login_stats_updated', data));
    socket.on('client_connected', (data) => handleEvent('client_connected', data));
    socket.on('client_disconnected', (data) => handleEvent('client_disconnected', data));
    socket.on('task_created', (data) => handleEvent('task_created', data));
    socket.on('task_updated', (data) => handleEvent('task_updated', data));
    socket.on('task_deleted', (data) => handleEvent('task_deleted', data));
    return () => {
      socket.off('login_stats_updated');
      socket.off('client_connected');
      socket.off('client_disconnected');
      socket.off('task_created');
      socket.off('task_updated');
      socket.off('task_deleted');
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-lg shadow-lg p-4 w-full max-w-md border-2 border-blue-700 mt-6">
      <div className="text-blue-300 font-semibold mb-2">Recent Activity</div>
      <ul className="space-y-1 max-h-64 overflow-y-auto text-blue-100 text-sm font-mono">
        {events.map((event, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">[{eventLabels[event.type] || event.type}]</span>
            <span>{event.message}</span>
            <span className="ml-auto text-xs text-blue-500">{event.timestamp.toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
