import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Filter,
  Megaphone,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

type Page = 'dashboard' | 'customers' | 'segments' | 'campaigns' | 'analytics' | 'ai-assistant';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
  { id: 'segments', label: 'Segments', icon: <Filter size={20} /> },
  { id: 'campaigns', label: 'Campaigns', icon: <Megaphone size={20} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
  { id: 'ai-assistant', label: 'AI Assistant', icon: <Bot size={20} /> },
];

interface LayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-white tracking-wide">XENO</div>
              <div className="text-xs text-gray-400">Mini CRM</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                currentPage === item.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="font-medium truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-gray-800">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-950">
        {children}
      </main>
    </div>
  );
}

export type { Page };
