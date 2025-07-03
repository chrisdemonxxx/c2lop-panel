"use client";
import React, { useEffect, useRef, useState } from "react";
import socket from '@/lib/socket';
import { useClientStore } from '@/lib/realtimeStore';
import UserPreferences, { UserPrefs } from './UserPreferences';
import { showHackerToast } from './HackerToast';

const DEFAULT_LINES = [
  "$ whoami",
  "sysadmin",
  "$ nmap -A 10.0.0.1",
  "Starting Nmap 7.80 ( https://nmap.org ) at 2025-07-03 00:51 UTC",
  "Nmap scan report for 10.0.0.1",
  "Host is up (0.0010s latency).",
  "PORT     STATE SERVICE VERSION",
  "22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)",
  "80/tcp   open  http    Apache httpd 2.4.29 ((Ubuntu))",
  "443/tcp  open  ssl/https",
  "MAC Address: 00:0C:29:4F:8E:35 (VMware)",
  "Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel",
  "$ echo 'Access granted'",
  "Access granted",
  "$ _"
];

const COMMANDS = {
  whoami: (...args: string[]) => ["sysadmin"],
  help: (...args: string[]) => ["Available commands:", "whoami, nmap, help, clear, access, trace"],
  clear: (...args: string[]) => [],
  access: (...args: string[]) => [
    "Verifying credentials...",
    { type: "access", granted: Math.random() > 0.5 },
  ],
  trace: (...args: string[]) => [
    "Tracing route...",
    { type: "trace" },
  ],
  nmap: (...args: string[]) => [
    "Starting Nmap 7.80 ( https://nmap.org ) at 2025-07-03 00:51 UTC",
    "Nmap scan report for 10.0.0.1",
    "Host is up (0.0010s latency).",
    "PORT     STATE SERVICE VERSION",
    "22/tcp   open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)",
    "80/tcp   open  http    Apache httpd 2.4.29 ((Ubuntu))",
    "443/tcp  open  ssl/https",
    "MAC Address: 00:0C:29:4F:8E:35 (VMware)",
    "Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel"
  ],
};

interface TerminalSimProps {
  prompt?: string;
  className?: string;
  style?: {};
  onlyClientId?: string;
  onClose?: () => void;
}

export default function TerminalSim({
  prompt = "$ ",
  className = "",
  style = {},
  onlyClientId,
  onClose,
}: TerminalSimProps) {
  const [socketReady, setSocketReady] = useState(false);
  useEffect(() => { setSocketReady(true); }, []);
  const clients = useClientStore((s) => s.clients) || [];
  const [targetClient, setTargetClient] = useState<string>(onlyClientId || "");
  // Each line is now an object: { text: string, ts: number }
  const [lines, setLines] = useState<{ text: string; ts: number }[]>([{ text: prompt, ts: Date.now() }]);
  const [input, setInput] = useState("");
  // Per-client command history
  const [history, setHistory] = useState<string[]>(() => {
    if (onlyClientId && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`terminalHistory_${onlyClientId}`);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  // Session log for export
  const sessionLogRef = useRef<string[]>([]);
  useEffect(() => {
    sessionLogRef.current = lines.map(l => l.text);
  }, [lines]);
  // Live status tracking
  const clientStatus = onlyClientId ? (clients.find((c: any) => c.id === onlyClientId)?.status?.toLowerCase() || 'unknown') : 'unknown';
  // Notification for disconnect
  useEffect(() => {
    if (onlyClientId && clientStatus === 'offline') {
      showHackerToast('Client went offline during session', 'error');
    }
  }, [clientStatus, onlyClientId]);
  const [anim, setAnim] = useState<{type: string, granted?: boolean}|null>(null);
  const [executing, setExecuting] = useState(false);
  const [prefs, setPrefs] = useState<UserPrefs>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("userPrefs");
        return saved ? { ...JSON.parse(saved) } : { sound: true, matrixRain: true, flicker: true, theme: "matrix" };
      } catch {
        return { sound: true, matrixRain: true, flicker: true, theme: "matrix" };
      }
    }
    return { sound: true, matrixRain: true, flicker: true, theme: "matrix" };
  });
  const [showPrefs, setShowPrefs] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onlyClientId) {
      setTargetClient(onlyClientId);
    } else if (clients.length > 0) {
      const online = clients.find((c: any) => c.status?.toLowerCase() === 'online');
      setTargetClient(online?.id || socket.id);
    } else {
      setTargetClient(socket.id);
    }
  }, [clients, onlyClientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, anim, executing]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [lines, anim, executing]);

  function playSound(type: string) {
    if (!prefs.sound) return;
    const url = type === "access"
      ? (anim?.granted ? "/sounds/access-granted.wav" : "/sounds/access-denied.wav")
      : type === "trace" ? "/sounds/trace-complete.wav" : "/sounds/terminal-blip.wav";
    const audio = new Audio(url);
    audio.volume = 0.25;
    audio.play();
  }

  function handleCommand(cmd: string) {
    setHistory((h) => {
      const updated = [...h, cmd];
      if (onlyClientId && typeof window !== 'undefined') {
        localStorage.setItem(`terminalHistory_${onlyClientId}`, JSON.stringify(updated));
      }
      return updated;
    });
    setHistoryIdx(-1);
    const [base, ...args] = cmd.trim().split(/\s+/);
    if (base === "clear") {
      setLines([{ text: prompt, ts: Date.now() }]);
      return;
    }
    const fn = COMMANDS[base as keyof typeof COMMANDS];
    if (!fn) {
      setLines(l => [...l, { text: cmd, ts: Date.now() }]);
      playSound("blip");
      setExecuting(true);
      const clientId = targetClient || socket.id;
      socket.emit('terminal_input', { clientId, input: cmd });
      const handler = ({ clientId: outId, output, done }: { clientId: string; output: string; done?: boolean }) => {
        if (outId === clientId) {
          setLines(l => [...l, { text: output, ts: Date.now() }]);
          if (done) {
            setLines(l => [...l, { text: prompt, ts: Date.now() }]);
            setExecuting(false);
            socket.off('terminal_output', handler);
          }
        }
      };
      socket.on('terminal_output', handler);
      setTimeout(() => {
        setExecuting(false);
        socket.off('terminal_output', handler);
        setLines(l => (l[l.length-1]?.text !== prompt ? [...l, { text: prompt, ts: Date.now() }] : l));
      }, 10000);
      return;
    }
    const out = fn(...args);
    let newLines = [{ text: cmd, ts: Date.now() }];
    for (let o of out) {
      if (typeof o === "string") newLines.push({ text: o, ts: Date.now() });
      else if (o.type === "access") {
        setTimeout(() => setAnim({type: "access", granted: o.granted}), 400);
        setTimeout(() => setAnim(null), 2100);
        setTimeout(() => setLines(l => [...l, { text: o.granted ? "ACCESS GRANTED" : "ACCESS DENIED", ts: Date.now() }, { text: prompt, ts: Date.now() }]), 2200);
        playSound("access");
        return;
      } else if (o.type === "trace") {
        setTimeout(() => setAnim({type: "trace"}), 500);
        setTimeout(() => setAnim(null), 2200);
        setTimeout(() => setLines(l => [...l, { text: "Trace complete.", ts: Date.now() }, { text: prompt, ts: Date.now() }]), 2300);
        playSound("trace");
        return;
      }
    }
    setLines(l => [...l, ...newLines, { text: prompt, ts: Date.now() }]);
    playSound("blip");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
    if (e.key === "c" && e.ctrlKey) {
      setLines(l => [...l, "^C", prompt]);
    }
    if (e.key === 'ArrowUp') {
      setHistoryIdx(idx => {
        const newIdx = idx < 0 ? history.length - 1 : Math.max(0, idx - 1);
        setInput(history[newIdx] || "");
        return newIdx;
      });
    }
    if (e.key === 'ArrowDown') {
      setHistoryIdx(idx => {
        const newIdx = idx < 0 ? -1 : Math.min(history.length - 1, idx + 1);
        setInput(history[newIdx] || "");
        return newIdx;
      });
    }
  }

  function exportSession() {
    const blob = new Blob([lines.map(l => l.text).join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-session-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Copy to clipboard
  function copySession() {
    navigator.clipboard.writeText(lines.map(l => l.text).join('\n'));
    showHackerToast('Terminal output copied!', 'success');
  }

  // Toggle timestamps
  const [showTimestamps, setShowTimestamps] = useState(false);

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto rounded-lg p-6 bg-black bg-opacity-80 border border-green-600 shadow-2xl hacker-terminal ${prefs.flicker ? 'animate-flicker' : ''} ${className}`}
      style={{ fontFamily: 'Fira Mono, monospace', boxShadow: '0 0 32px #0f08', ...(typeof style === 'object' && style !== null ? style : {}) }}
    >
      {/* Live status indicator */}
      {onlyClientId && (
        <span className="absolute right-4 top-2 flex items-center gap-1">
          <span
            className={`inline-block w-3 h-3 rounded-full ${clientStatus === 'online' ? 'bg-green-500' : clientStatus === 'offline' ? 'bg-red-500' : 'bg-gray-500'}`}
            title={`Status: ${clientStatus}`}
          ></span>
        </span>
      )}
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          onClick={copySession}
          className="px-2 py-1 bg-black border border-green-600 text-green-400 rounded shadow hover:bg-green-900/30 text-xs font-mono animate-flicker"
          title="Copy terminal output to clipboard"
        >
          Copy
        </button>
        <button
          onClick={exportSession}
          className="px-2 py-1 bg-black border border-green-600 text-green-400 rounded shadow hover:bg-green-900/30 text-xs font-mono animate-flicker"
          title="Export terminal session as text"
        >
          Export
        </button>
        <button
          onClick={() => setShowTimestamps(v => !v)}
          className={`px-2 py-1 border text-xs font-mono rounded animate-flicker ${showTimestamps ? 'bg-green-900 text-green-300 border-green-600' : 'bg-black text-green-400 border-green-600'}`}
          title="Toggle per-line timestamps"
        >
          {showTimestamps ? 'Hide TS' : 'Show TS'}
        </button>
      </div>
      <button
        onClick={() => setShowPrefs(s => !s)}
        className="absolute right-28 top-4 px-2 py-1 bg-black border border-green-600 text-green-400 rounded shadow hover:bg-green-900/30 text-xs font-mono animate-flicker"
        title="Open user preferences"
      >
        <span role="img" aria-label="settings">⚙️</span>
      </button>
      {showPrefs && (
        <div className="absolute right-4 top-12 z-30">
          <UserPreferences
            onChange={setPrefs}
            className="shadow-2xl animate-flicker"
          />
        </div>
      )}
      {anim && anim.type === "access" && (
        <div className={`absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-80 animate-flicker ${anim.granted ? 'text-green-400' : 'text-red-400'} text-4xl font-bold`}>
          {anim.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
        </div>
      )}
      {anim && anim.type === "trace" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-80 animate-flicker text-green-400 text-4xl font-bold">
          TRACE COMPLETE
        </div>
      )}
      <div ref={scrollRef} className="overflow-y-auto h-80 pb-2 hacker-scrollbar" style={{ whiteSpace: 'pre-wrap', fontSize: 15 }}>
        {lines.map((line, i) => (
          <div key={i} className="text-green-400 flex items-center gap-2" style={{textShadow: '0 0 6px #0f0'}}>
            {showTimestamps && (
              <span className="text-xs text-gray-400 min-w-[70px]">{new Date(line.ts).toLocaleTimeString()}</span>
            )}
            <span>{line.text}</span>
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-400" style={{textShadow: '0 0 6px #0f0'}}>{prompt}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-green-400 flex-1 hacker-input"
            style={{ minWidth: 10 }}
            autoComplete="off"
            disabled={!!anim || executing}
          />
          {executing && <span className="ml-2 animate-spin text-green-400"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg></span>}
        </div>
      </div>
      {!onlyClientId && (
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-green-400">Target Client:</label>
          <select
            value={targetClient}
            onChange={e => setTargetClient(e.target.value)}
            className="bg-black border border-green-600 text-green-400 rounded px-2 py-1 font-mono text-xs"
          >
            {clients.length === 0 && (
              <option value={socketReady && socket.id ? socket.id : ""}>This Panel ({socketReady && socket.id ? socket.id.slice(0, 8) : "..."})</option>
            )}
            {clients.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.hostname || (c.id ? c.id.slice(0, 8) : "unknown")} [{c.status}]
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
