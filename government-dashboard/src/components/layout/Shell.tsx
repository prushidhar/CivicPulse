import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Map, MessageSquare, AlertCircle, HardDrive, FileText, Menu, X, Bell, Search, UserCircle, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Hotspot Map', path: '/map', icon: Map },
  { name: 'Citizen Requests', path: '/requests', icon: MessageSquare },
  { name: 'Recommendations', path: '/recommendations', icon: AlertCircle },
  { name: 'Infrastructure', path: '/infrastructure', icon: HardDrive },
  { name: 'Audit Console', path: '/audit', icon: FileText },
];

export default function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:w-72 lg:flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-border/40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Corra</span>
          </div>
          <button className="lg:hidden text-muted-foreground hover:text-foreground bg-muted p-2 rounded-full" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Public Services</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={cn("w-5 h-5 mr-3 flex-shrink-0 transition-colors", 
                    "group-hover:text-primary")} 
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 m-4 rounded-2xl bg-muted/50 border border-border/50">
          <div className="flex items-center">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm mr-3" />
            <div>
              <p className="text-sm font-bold text-foreground">Gov Reviewer</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Subtle background glow effect inspired by modern AI apps */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <header className="flex items-center justify-between h-20 px-6 bg-transparent lg:px-10 z-10">
          <div className="flex items-center flex-1">
            <button
              className="p-2 mr-4 text-muted-foreground hover:bg-white hover:shadow-sm rounded-xl lg:hidden transition-all"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search assistant logs, requests, hotspots..."
                className="w-full bg-white border border-border/50 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-2.5 text-muted-foreground bg-white border border-border/50 shadow-sm hover:shadow-md rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-destructive ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 relative z-10 overflow-y-auto focus:outline-none px-6 lg:px-10 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
