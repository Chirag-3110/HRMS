'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Navigation, 
  Activity, 
  UserPlus, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Compass,
  FileText,
  Clock,
  ChevronRight,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { 
  useAnalyticsSummary, 
  useRegistrationTrends, 
  useRoleBreakdown 
} from '@/lib/hooks/useAnalytics';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Premium HSL-tailored colors
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6'];

// Mock Sparkline data for metrics cards
const sparklineData = [
  { val: 10 }, { val: 12 }, { val: 9 }, { val: 15 }, { val: 18 }, { val: 16 }, { val: 24 }
];
const distanceSparkline = [
  { val: 50 }, { val: 65 }, { val: 78 }, { val: 92 }, { val: 84 }, { val: 105 }, { val: 120 }
];

export default function AnalyticsDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  // Fetch backend statistics
  const { data: summary, isLoading: loadingSummary } = useAnalyticsSummary();
  const { data: trends, isLoading: loadingTrends } = useRegistrationTrends();
  const { data: roles, isLoading: loadingRoles } = useRoleBreakdown();

  // Fleet workers status state
  const [workers, setWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  useEffect(() => {
    fetchWorkersStatus();
  }, []);

  const fetchWorkersStatus = async () => {
    try {
      setLoadingWorkers(true);
      const res = await axios.get('/api/admin/tracking');
      setWorkers(res.data.workers || []);
    } catch (error) {
      console.error('Failed to load workers status:', error);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const activeWorkersCount = workers.filter(w => w.activeShift?.status === 'checked_in').length;
  const totalKmToday = workers.reduce((acc, w) => {
    if (w.activeShift?.date === new Date().toISOString().split('T')[0]) {
      return acc + (w.activeShift.totalDistanceKm || 0);
    }
    return acc;
  }, 0);

  const formatNumber = (num: number) => num?.toLocaleString('en-US') || 0;

  // Format data for Recharts Pie Chart
  const roleChartData = roles?.data?.map((item, idx) => ({
    name: item.role === 'FieldWorker' ? 'Field Workers' : `${item.role}s`,
    value: item.count,
    color: COLORS[idx % COLORS.length]
  })) || [];

  const totalRoleCount = roleChartData.reduce((acc, r) => acc + r.value, 0) || 1;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Top Banner with sleek dashboard statistics overview */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#1e1b4b] rounded-[36px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-slate-900">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3.5 max-w-2xl">
            <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full inline-block">
              ENTERPRISE DEPLOYMENT
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mt-1 leading-tight">
              Operational Intelligence Command
            </h2>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg">
              Manage field personnel deployments, calculate fleet journey telemetry, and audit organizational permissions.
            </p>
          </div>
          
          {/* Quick Stats overview bubble */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-5 shrink-0 flex items-center gap-5">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Activity className="h-6 w-6 text-emerald-500 animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Real-time status</span>
              <span className="text-sm font-black text-white uppercase mt-0.5 block tracking-wide">All Engines Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics Cards with Glowing Sparklines */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Metric: Total System Users */}
        <Card className="rounded-[30px] border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 bg-white p-5 flex flex-col justify-between h-44 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Fleet</span>
              {loadingSummary ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {summary ? formatNumber(summary.totalUsers) : 0}
                </h3>
              )}
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Users className="h-5 w-5" />
            </div>
          </div>
          
          {/* Sparkline visualization */}
          <div className="h-10 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metric: Active User Accounts */}
        <Card className="rounded-[30px] border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 bg-white p-5 flex flex-col justify-between h-44 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Employees</span>
              {loadingSummary ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {summary ? formatNumber(summary.activeUsers) : 0}
                </h3>
              )}
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="h-10 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metric: Active shifts on duty */}
        <Card className="rounded-[30px] border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 bg-white p-5 flex flex-col justify-between h-44 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">On Active Duty</span>
              {loadingWorkers ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5 flex items-baseline gap-1.5">
                  {activeWorkersCount}
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                </h3>
              )}
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Navigation className="h-5 w-5" />
            </div>
          </div>

          <div className="h-10 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metric: Total Fleet Distance */}
        <Card className="rounded-[30px] border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 bg-white p-5 flex flex-col justify-between h-44 group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Distance Mapped</span>
              {loadingWorkers ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
              ) : (
                <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {totalKmToday.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">km</span>
                </h3>
              )}
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="h-10 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={distanceSparkline}>
                <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Row 1: Charts Section (Widescreen Optimized Layout) */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        
        {/* User Registration Trend Chart (2 columns) */}
        <Card className="lg:col-span-2 rounded-[32px] border border-slate-200/60 shadow-sm p-6 flex flex-col h-[440px] bg-white">
          <CardHeader className="p-0 pb-6 shrink-0 flex flex-row items-center justify-between space-y-0">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">User Registrations Trend</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Monthly registrations timeline logs</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Signups up 18%</span>
            </div>
          </CardHeader>
          
          <div className="flex-1 min-h-0">
            {loadingTrends ? (
              <LoadingSkeleton variant="chart" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends?.data || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                    labelStyle={{ fontWeight: 'black', color: '#818cf8', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* User Role Distribution Pie Chart & Progress Bars (1 column) */}
        <Card className="rounded-[32px] border border-slate-200/60 shadow-sm p-6 flex flex-col h-[440px] bg-white justify-between">
          <CardHeader className="p-0 shrink-0">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Role Breakdown</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">User directory breakdown metrics</p>
          </CardHeader>
          
          <div className="h-44 relative flex items-center justify-center shrink-0">
            {loadingRoles ? (
              <LoadingSkeleton variant="chart" />
            ) : roleChartData.length === 0 ? (
              <p className="text-xs text-slate-400">No role data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Elegant stats listing showing role count and visual progress bars */}
          <div className="space-y-2.5 mt-4 flex-1 overflow-y-auto pr-1">
            {!loadingRoles && roleChartData.map((role) => {
              const pct = ((role.value / totalRoleCount) * 100).toFixed(0);
              return (
                <div key={role.name} className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color }}></span>
                      {role.name}
                    </span>
                    <span className="font-mono text-slate-900">{role.value} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ backgroundColor: role.color, width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* Row 2: Live Tracking dispatch center map overview & control shortcuts */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        
        {/* Field Workers Live Telemetry List */}
        <Card className="lg:col-span-2 rounded-[32px] border border-slate-200/60 shadow-sm p-6 flex flex-col bg-white">
          <CardHeader className="p-0 pb-6 shrink-0 flex flex-row items-center justify-between space-y-0">
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Field Fleet Telemetry Dispatch</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Active field shifts and odometer tracker logs</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/tracking')}
              className="text-xs font-bold uppercase tracking-wider text-slate-700 border-gray-300 rounded-xl h-10 px-4"
            >
              Open Route Mapping
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardHeader>
          
          <div className="flex-1 overflow-x-auto border border-gray-150 rounded-2xl min-h-0">
            {loadingWorkers ? (
              <LoadingSkeleton variant="table" rows={3} />
            ) : workers.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Compass className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold">No registered field workers</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 sticky top-0 border-b border-gray-200 text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                    <th className="py-3 px-4">Field Employee</th>
                    <th className="py-3 px-4">Tracking Status</th>
                    <th className="py-3 px-4">GPS Coordinate Fixed</th>
                    <th className="py-3 px-4 text-right">Traveled Odometer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-sans">
                  {workers.map((worker) => {
                    const isActive = worker.activeShift?.status === 'checked_in';
                    const hasShiftToday = worker.activeShift?.date === new Date().toISOString().split('T')[0];
                    return (
                      <tr key={worker.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">{worker.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{worker.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isActive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                            {isActive ? 'Live Tracking' : 'Offline'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px]">
                          {worker.latestLocation ? (
                            <span className="flex items-center gap-1.5 text-slate-700 font-semibold bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/40 w-fit">
                              <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                              {worker.latestLocation.latitude.toFixed(4)}, {worker.latestLocation.longitude.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-slate-400">No telemetry fixed</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 font-mono">
                          {hasShiftToday ? `${worker.activeShift.totalDistanceKm} km` : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Control Console Shortcuts & System Logs */}
        <Card className="rounded-[32px] border border-slate-200/60 shadow-sm p-6 flex flex-col justify-between h-full bg-white">
          <div className="space-y-5">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Control Shortcuts</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Expedite administrative routines using direct access controls.
            </p>
            
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => router.push('/users/create')}
                className="w-full bg-slate-900 hover:bg-slate-850 text-white text-xs font-black uppercase tracking-wider rounded-xl h-11 justify-start px-4 shadow-md transition-all duration-200 active:scale-95"
              >
                <UserPlus className="h-4 w-4 mr-2.5 text-blue-400" />
                Register New Employee
              </Button>

              <Button
                onClick={() => router.push('/tracking')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl h-11 justify-start px-4 border border-slate-200/50 transition-all duration-200 active:scale-95"
              >
                <Compass className="h-4 w-4 mr-2.5 text-indigo-500 animate-spin-slow" />
                Open GPS Telemetry
              </Button>

              <Button
                onClick={() => router.push('/users')}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl h-11 justify-start px-4 border border-slate-200/50 transition-all duration-200 active:scale-95"
              >
                <FileText className="h-4 w-4 mr-2.5 text-emerald-500" />
                Audit System Directory
              </Button>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 font-black border-t border-slate-100 pt-5 mt-6 uppercase tracking-widest flex items-center justify-between shrink-0">
            <span>Client Version 2.4.0</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> System Normal
            </span>
          </div>
        </Card>

      </div>

    </div>
  );
}
