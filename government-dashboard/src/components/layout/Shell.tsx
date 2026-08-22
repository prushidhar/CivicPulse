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
  const [globalSearch, setGlobalSearch] = useState('');

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
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-sm",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center px-6 border-b border-border/50 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">CivicPulse <span className="text-primary">Admin</span></span>
          </div>
          <button 
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-4 py-6">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Core Systems</div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border/50">
            <UserCircle className="w-10 h-10 text-muted-foreground" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">Government of India</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 bg-background/80 backdrop-blur-md border-b border-border/50 z-30 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search citizen requests, AI logs, insights..."
                className="w-full bg-white border border-border/50 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => alert("3 new AI recommendations require review.")}
              className="relative p-2.5 text-muted-foreground bg-white border border-border/50 shadow-sm hover:shadow-md rounded-xl transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-destructive ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 relative z-10 overflow-y-auto focus:outline-none px-6 lg:px-10 pb-10">
          <Outlet context={{ globalSearch }} />
        </main>
      </div>
    </div>
  );
}
