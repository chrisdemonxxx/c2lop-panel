"use client";
import React, { useState } from "react";

const BUILT_IN_COMMANDS = [
  "ls",
  "df -h",
  "uptime",
  "whoami",
  "cat /etc/os-release",
  "free -m",
  "ps aux",
  "top -b -n1",
  "reboot"
];

export default function TaskSchedulerModal({ open, onClose, onSchedule, clientOptions, modalClassName = "" }) {
  const [selectedClients, setSelectedClients] = useState([]);
  const [command, setCommand] = useState(BUILT_IN_COMMANDS[0]);
  const [scheduleTime, setScheduleTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleClientSelect(id) {
    setSelectedClients(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await onSchedule({ clients: selectedClients, command, scheduleTime });
    setSubmitting(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-mono">
      <div className={`bg-gray-900 p-6 rounded shadow-lg w-full max-w-md border-2 border-green-500 shadow-[0_0_16px_#0f0] relative ${modalClassName}`}
        style={{backgroundImage: 'repeating-linear-gradient(0deg, #0f0 0px, #0f0 1px, transparent 2px, transparent 10px)'}}>
        <h2 className="text-xl font-bold mb-4 text-green-400 drop-shadow-[0_0_6px_#0f0]">Schedule Task</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-semibold">Clients</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {clientOptions.map(c => (
              <label key={c.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedClients.includes(c.id)}
                  onChange={() => handleClientSelect(c.id)}
                />
                <span>{c.hostname}</span>
              </label>
            ))}
          </div>
          <label className="block mb-2 font-semibold">Command</label>
          <select
            value={command}
            onChange={e => setCommand(e.target.value)}
            className="w-full mb-4 px-2 py-1 rounded bg-gray-800 text-white border border-gray-700"
          >
            {BUILT_IN_COMMANDS.map(cmd => (
              <option key={cmd} value={cmd}>{cmd}</option>
            ))}
          </select>
          <label className="block mb-2 font-semibold">Schedule Time (optional)</label>
          <input
            type="datetime-local"
            value={scheduleTime}
            onChange={e => setScheduleTime(e.target.value)}
            className="w-full mb-4 px-2 py-1 rounded bg-gray-800 text-white border border-gray-700"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={onClose} disabled={submitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-green-900 text-green-300 shadow-[0_0_8px_#0f0] animate-flicker font-mono" style={{textShadow: '0 0 8px #0f0'}} disabled={submitting || selectedClients.length === 0}>{submitting ? "Scheduling..." : "Schedule"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
