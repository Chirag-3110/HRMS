'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Navigation, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  User,
  Activity,
  Menu,
  X,
  Bell,
  Search,
  Database,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sysTime, setSysTime] = useState('');

  // Live ticking clock in top header
  useEffect(() => {
    setSysTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const t = setInterval(() => {
      setSysTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const navigation = [
    { name: 'Analytics Hub', href: '/', icon: BarChart3, desc: 'Performance telemetry' },
    { name: 'User Management', href: '/users', icon: Users, desc: 'System directory & access' },
    { name: 'Field Journey Tracking', href: '/tracking', icon: Navigation, desc: 'Live fleet GPS mapping' },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-slate-100/60 to-indigo-50/40 min-h-screen flex flex-col md:flex-row p-0 font-sans antialiased overflow-hidden">
      
      {/* Sidebar - Floating Dark Card - Desktop */}
      <aside className="hidden md:flex flex-col w-80 h-[calc(100vh-2rem)] m-4 mr-0 rounded-[32px] bg-slate-950 text-slate-200 border border-slate-900 shadow-2xl shrink-0 flex-col overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:100%_40px]"></div>
        
        {/* Brand Header */}
        <div className="p-7 border-b border-slate-900/80 flex items-center gap-4 shrink-0 relative z-10">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 animate-pulse">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest leading-none">Phelbo Go</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Enterprise Portal</p>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto relative z-10">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-start gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/15 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:translate-x-1'
                }`}
              >
                <item.icon className={`h-5 w-5 mt-0.5 shrink-0 transition-transform duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                <div className="space-y-0.5">
                  <span className="text-xs font-black uppercase tracking-wider block">{item.name}</span>
                  <span className={`text-[9px] block ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {item.desc}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Action Center */}
        <div className="p-5 border-t border-slate-900 bg-slate-950/80 shrink-0 space-y-4 relative z-10">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-900/40 border border-slate-900">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-blue-400 border border-slate-700 shrink-0">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-black text-white truncate leading-none">{session?.user?.name || 'Super Administrator'}</h4>
              <p className="text-[9px] text-slate-500 truncate mt-1">{session?.user?.email || 'admin@phelbo.com'}</p>
            </div>
          </div>

          <Button
            onClick={() => signOut({ callbackUrl: '/login' })}
            variant="ghost"
            className="w-full text-xs font-black uppercase text-slate-400 hover:text-red-400 hover:bg-slate-900/50 rounded-2xl justify-start h-11 border border-transparent hover:border-red-950/20 px-4 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            Terminate Session
          </Button>
        </div>
      </aside>

      {/* Header - Mobile Layout */}
      <header className="md:hidden bg-[#0f172a] text-slate-200 px-6 py-4 flex justify-between items-center shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-white">Phelbo Go Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 bg-[#0f172a] h-full flex flex-col p-6 animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              <span className="text-sm font-black text-white uppercase tracking-wider">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold uppercase ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-800 pt-4">
              <Button
                onClick={() => signOut({ callbackUrl: '/login' })}
                variant="ghost"
                className="w-full text-xs font-bold uppercase text-slate-400 hover:text-red-400 justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Frame - Floating Light Card - Desktop */}
      <div className="flex-1 h-[calc(100vh-2rem)] md:m-4 flex flex-col overflow-hidden bg-white rounded-none md:rounded-[32px] border border-gray-200/80 shadow-sm relative">
        
        {/* Spacious Top Navigation Header Bar */}
        <header className="hidden md:flex bg-white/80 h-20 border-b border-gray-100 items-center justify-between px-10 shrink-0 backdrop-blur-md z-30">
          <div className="space-y-0.5">
            <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Enterprise Console</span>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {pathname === '/' ? 'Operational Analytics Hub' : pathname.startsWith('/users') ? 'System User Directory' : 'Field Fleet Live Dispatch'}
            </h2>
          </div>

          {/* Header Controls Center */}
          <div className="flex items-center gap-6">
            
            {/* System Status Metrics */}
            <div className="flex items-center gap-4 border-r border-gray-150 pr-6 text-[10px] font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-emerald-500" />
                <span>DB: <span className="text-slate-800 font-extrabold">CONNECTED</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin-slow" />
                <span>SYNC: <span className="text-slate-800 font-extrabold">LIVE</span></span>
              </div>
            </div>

            {/* Time & Alert info */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
              <span className="font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/40">{sysTime}</span>
              <button className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-gray-200/30 relative">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Spacious Content Render Portal */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 min-h-0 bg-slate-50/30">
          <div className="max-w-[1500px] mx-auto w-full">
            {children}
          </div>
        </div>
      </div>

    </div>
  );
}
