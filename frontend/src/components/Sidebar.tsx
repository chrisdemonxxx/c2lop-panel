'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', icon: '📋', href: '/dashboard' },
  { label: 'Clients', icon: '🖥️', href: '/dashboard/clients' },
  { label: 'Tasks', icon: '📄', href: '/dashboard/tasks' },
  { label: 'Settings', icon: '⚙️', href: '/dashboard/settings' },
];

const isActive = (href) => {
  const pathname = usePathname();
  return pathname === href;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={`backdrop-blur-lg bg-black/80 text-green-300 ${collapsed ? 'w-16' : 'w-56'} min-h-screen flex flex-col px-2 py-6 shadow-2xl border-r border-green-900 transition-all duration-300 font-sans relative z-20`}
      aria-label="Sidebar"
    >
      <button
        className="absolute top-4 right-2 bg-green-900/80 hover:bg-green-700 text-green-200 shadow-lg rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 z-30"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed((c) => !c)}
        tabIndex={0}
        style={{ width: 36, height: 36 }}
      >
        {collapsed ? '➡️' : '⬅️'}
      </button>
      <ul className="flex-1 space-y-2 mt-12" role="menu">
        {navItems.map((item, idx) => (
          <li key={item.href} role="none">
            <Link
              href={item.href}
              className={
                (isActive(item.href)
                  ? "bg-gradient-to-r from-green-900/80 to-green-800/60 text-green-200 shadow-lg"
                  : "hover:bg-green-800/60 hover:text-green-100") +
                ` flex items-center gap-4 px-4 py-3 rounded-xl mb-2 transition-all duration-200 font-semibold text-base tracking-wide group relative ${collapsed ? 'justify-center' : ''}`
              }
              aria-current={isActive(item.href) ? "page" : undefined}
              tabIndex={0}
              role="menuitem"
              style={{ textShadow: isActive(item.href) ? '0 0 6px #0f0' : undefined, minHeight: 48 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  (e.target as HTMLElement).click();
                }
                // Arrow key navigation
                if (e.key === 'ArrowDown') {
                  const next = (e.currentTarget.parentElement?.nextElementSibling?.querySelector('a') as HTMLElement);
                  next?.focus();
                }
                if (e.key === 'ArrowUp') {
                  const prev = (e.currentTarget.parentElement?.previousElementSibling?.querySelector('a') as HTMLElement);
                  prev?.focus();
                }
              }}
            >
              <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </span>
              {!collapsed && (
                <span className="whitespace-nowrap text-green-100 text-lg font-medium tracking-tight pl-2 drop-shadow-lg">
                  {item.label}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
