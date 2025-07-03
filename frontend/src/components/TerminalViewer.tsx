'use client';
import React from 'react';
import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import socket from '../lib/socket';

// Props: output (string), clientId (string)
export default function TerminalViewer({ output, clientId }) {
  const terminalRef = useRef(null);
  const term = useRef(null);

  // Write output to terminal on update
  useEffect(() => {
    if (!term.current) {
      term.current = new Terminal({
        convertEol: true,
        cursorBlink: true,
        rows: 20,
        cols: 80,
        theme: {
          background: '#1e1e1e',
          foreground: '#ffffff',
        },
      });
      term.current.open(terminalRef.current);
      // Attach input listener
      term.current.onData((data) => {
        socket.emit('terminal_input', { clientId, input: data });
      });
    }
    term.current.clear();
    term.current.write(output || 'No output yet...\r\n');
  }, [output, clientId]);

  // Listen for output from server
  useEffect(() => {
    if (!clientId) return;
    const handleOutput = (data) => {
      if (data.clientId === clientId && term.current) {
        term.current.write(data.output);
      }
    };
    socket.on('terminal_output', handleOutput);
    return () => {
      socket.off('terminal_output', handleOutput);
    };
  }, [clientId]);

  // Clear terminal on client/session change
  useEffect(() => {
    if (term.current) term.current.clear();
  }, [clientId]);

  return <div ref={terminalRef} style={{ padding: '1rem' }} />;
}