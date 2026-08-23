import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, MessageSquare, AlertCircle, HardDrive, FileText, Menu, X, Bell, Search, UserCircle, Sparkles, LogOut, Hexagon } from 'lucide-react';
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
  const [clock, setClock] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Glassmorphism UI */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-20 items-center px-6 border-b border-gray-100 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-inner shadow-white/20">
              <Hexagon className="w-6 h-6 text-white absolute" />
              <div className="w-2 h-2 bg-white rounded-full z-10 animate-pulse"></div>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900">Civic<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pulse</span></span>
          </div>
          <button 
            className="ml-auto lg:hidden text-gray-500 hover:text-gray-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-4 py-8 overflow-y-auto h-[calc(100vh-10rem)]">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-3">Mission Systems</div>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "mr-4 flex-shrink-0 h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"
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

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
            <UserCircle className="w-10 h-10 text-gray-400" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-gray-900">Command Admin</p>
              <p className="text-[10px] uppercase font-bold text-gray-400 truncate tracking-wider">Gov of India</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 z-30 sticky top-0 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-xl hidden sm:block">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search AI metrics, citizen reports, hotspots..."
                className="w-full bg-gray-100/50 border border-gray-200 shadow-inner rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Time</span>
              <span className="text-sm font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{clock}</span>
            </div>
            <a 
              href={import.meta.env.VITE_CITIZEN_URL || "https://civic-pulse-citizen.vercel.app"} 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex text-sm font-extrabold text-blue-600 hover:text-indigo-600 transition-colors gap-1 items-center"
            >
              Citizen Portal <ArrowUpRight className="w-4 h-4" />
            </a>
            <button 
              onClick={() => navigate('/recommendations')}
              className="relative p-3 text-gray-500 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 rounded-2xl transition-all"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-white"></span>
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 relative z-10 overflow-y-auto focus:outline-none">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <Outlet context={{ globalSearch }} />
          </div>
        </main>
      </div>
    </div>
  );
}
