'use client';
import { useEffect, useState } from 'react';

const themes = [
  'matrix', 'anonymous', 'kali', 'cyber', 'midnight',
  'retro', 'mono', 'cyberpunk', 'wireframe', 'stealth'
];

export default function ThemeSwitcher() {
  const [selected, setSelected] = useState('matrix');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'matrix';
    setSelected(saved);
    document.body.className = saved;
  }, []);

  const [pending, setPending] = useState('matrix');

  const handleChange = (e) => {
    const value = e.target.value;
    setPending(value);
  };

  const handleApply = () => {
    setSelected(pending);
    document.body.className = pending;
    localStorage.setItem('theme', pending);
  };

  return (
    <div>
      <label>Theme:</label>
      <select value={pending} onChange={handleChange}>
        {themes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button style={{marginLeft: '1rem'}} onClick={handleApply}>Apply</button>
    </div>
  );
}