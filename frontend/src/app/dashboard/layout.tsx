import React from 'react';
// Neon accent color: #00ffae (green/cyan), can be changed for other neon colors.

import Sidebar from '@/components/Sidebar';
import MatrixRain from '../../components/MatrixRain';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  let matrixRain = true;
  if (typeof window !== 'undefined') {
    try {
      const prefs = JSON.parse(localStorage.getItem('userPrefs') || '{}');
      matrixRain = prefs.matrixRain !== false;
    } catch {}
  }
  return (
    <div className="relative min-h-screen bg-[#181a20] font-sans">
      <MatrixRain show={matrixRain} />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto bg-[#181a20] shadow-[0_0_40px_#00ffae33] border-l border-[#00ffae22] rounded-l-3xl transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
