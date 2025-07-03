'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';
import { useSocketRealtime, useTaskStore } from '@/lib/realtimeStore';
import TerminalViewer from '@/components/TerminalViewer';

export default function ClientDetailPage() {
  const { clientId } = useParams();
const clientIdStr = Array.isArray(clientId) ? clientId[0] : clientId;
  const tasks = Object.values(useTaskStore((s) => s.tasks) || {}).filter((t: any) => t.clientId === clientIdStr);
  const [command, setCommand] = useState('');
  useSocketRealtime();
  const taskResults = useTaskStore((s) => s.taskResults);

  const handleSubmit = async () => {
    await api.post('/tasks', { clientId, command });
    setCommand('');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Client: {clientIdStr}</h2>
      <div>
        <input value={command} onChange={e => setCommand(e.target.value)} placeholder="Enter command" />
        <button onClick={handleSubmit}>Send</button>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3>Interactive Terminal</h3>
        <TerminalViewer clientId={clientIdStr} output={taskResults[clientIdStr]?.output || ''} />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3>Task History</h3>
        <ul>
          {tasks.map(t => (
            <li key={t.id}>
              <strong>{typeof t.command === 'object' ? JSON.stringify(t.command) : t.command}</strong> → {typeof (taskResults[clientIdStr]?.output || t.result?.output) === 'object'
                ? JSON.stringify(taskResults[clientIdStr]?.output || t.result?.output)
                : (taskResults[clientIdStr]?.output || t.result?.output || 'Pending')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}