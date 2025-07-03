"use client";
import React, { useEffect, useState } from "react";

const defaultPrefs = {
  sound: true,
  matrixRain: true,
  flicker: true,
  theme: "matrix",
};

export type UserPrefs = typeof defaultPrefs;

export default function UserPreferences({
  onChange,
  className = "",
}: {
  onChange?: (prefs: UserPrefs) => void;
  className?: string;
}) {
  const [prefs, setPrefs] = useState<UserPrefs>(defaultPrefs);

  // Load from backend on mount
  useEffect(() => {
    let mounted = true;
    async function fetchPrefs() {
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/admin/settings');
        if (mounted && res.data) setPrefs({ ...defaultPrefs, ...res.data });
      } catch {
        // fallback/defaultPrefs
      }
    }
    fetchPrefs();
    // Listen for real-time settings updates
    import('@/lib/socket').then(({ default: socket }) => {
      function onSettingsUpdate(data: any) {
        setPrefs(prev => {
          document.body.className = data.theme || prev.theme;
          return { ...prev, ...data };
        });
      }
      socket.on('settings_updated', onSettingsUpdate);
      // Cleanup
      return () => socket.off('settings_updated', onSettingsUpdate);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (onChange) onChange(prefs);
    document.body.className = prefs.theme;
    // Save to backend and emit real-time update
    (async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const socket = (await import('@/lib/socket')).default;
        await api.put('/admin/settings', prefs);
        socket.emit('settings_updated', prefs);
      } catch {}
    })();
  }, [prefs, onChange]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, value } = e.target;
    let checked = false;
    if (type === 'checkbox') {
      checked = (e.target as HTMLInputElement).checked;
    }
    setPrefs(p => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <div className={`rounded-lg border border-green-600 bg-black bg-opacity-80 p-4 w-full max-w-xs shadow-lg font-mono text-green-400 ${className}`}>
      <div className="mb-2 text-lg font-bold text-green-300">Preferences</div>
      <label className="flex items-center gap-2 mb-2">
        <input type="checkbox" name="sound" checked={prefs.sound} onChange={handleChange} />
        Sound Effects
      </label>
      <label className="flex items-center gap-2 mb-2">
        <input type="checkbox" name="matrixRain" checked={prefs.matrixRain} onChange={handleChange} />
        Matrix Rain
      </label>
      <label className="flex items-center gap-2 mb-2">
        <input type="checkbox" name="flicker" checked={prefs.flicker} onChange={handleChange} />
        CRT Flicker
      </label>
      <label className="flex items-center gap-2 mb-2">
        <span>Theme:</span>
        <select name="theme" value={prefs.theme} onChange={handleChange} className="bg-black border border-green-600 text-green-400 rounded px-2 py-1 font-mono text-xs">
          <option value="matrix">matrix</option>
          <option value="anonymous">anonymous</option>
          <option value="kali">kali</option>
          <option value="cyber">cyber</option>
          <option value="midnight">midnight</option>
          <option value="retro">retro</option>
          <option value="mono">mono</option>
          <option value="cyberpunk">cyberpunk</option>
          <option value="wireframe">wireframe</option>
          <option value="stealth">stealth</option>
        </select>
      </label>
    </div>
  );
}
