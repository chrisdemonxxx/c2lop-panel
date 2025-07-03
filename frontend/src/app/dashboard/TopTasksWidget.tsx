import React from 'react';
import { useTaskStore } from '@/lib/realtimeStore';

export default function TopTasksWidget() {
  // Get all tasks from the store
  const tasksObj = useTaskStore((s) => s.tasks);
  const tasks = Object.values(tasksObj || {});

  // Aggregate by command name
  const commandCounts: Record<string, number> = {};
  tasks.forEach((task: any) => {
    const cmd = task.command || 'Unknown';
    commandCounts[cmd] = (commandCounts[cmd] || 0) + 1;
  });

  // Sort commands by frequency
  const sorted = Object.entries(commandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (tasks.length === 0) {
    return <div className="text-blue-400 opacity-60">No tasks yet</div>;
  }

  return (
    <ul className="space-y-2 text-blue-100 text-sm font-mono">
      {sorted.map(([cmd, count]) => (
        <li key={cmd}>
          {cmd} <span className="ml-2 text-xs text-blue-400">{count} run{count > 1 ? 's' : ''}</span>
        </li>
      ))}
    </ul>
  );
}
