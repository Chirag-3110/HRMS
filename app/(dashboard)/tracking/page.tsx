'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { 
  Users, 
  MapPin, 
  Clock, 
  Activity, 
  CalendarDays, 
  Navigation, 
  AlertCircle,
  Map,
  FileSpreadsheet,
  ArrowRight,
  Compass,
  LayoutDashboard,
  Play,
  Pause,
  RotateCcw,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorNotification } from '@/components/common/ErrorNotification';
import axios from 'axios';

// Dynamically import the map to avoid Next.js SSR issues with Leaflet
const TrackingMap = dynamic(() => import('@/components/tracking/TrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 rounded-[32px] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden min-h-[500px]">
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:100%_32px]"></div>
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 z-10"></div>
      <span className="ml-3 font-black text-[9px] tracking-widest uppercase text-slate-500 mt-4 z-10 font-mono">Initializing satellite mapping...</span>
    </div>
  ),
});

function AdminTrackingDashboardContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const activeTenantId = searchParams.get('tenantId') || 'apex-logistics';

  // Selected state
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Telemetry details state
  const [workerDetails, setWorkerDetails] = useState<any>(null);
  const [shiftDetails, setShiftDetails] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]);

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulatedIndex, setSimulatedIndex] = useState<number>(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x

  // Loaders and errors
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference to scrolling active coordinate row
  const activeRowRef = useRef<HTMLTableRowElement>(null);
  const coordinatesTableContainerRef = useRef<HTMLDivElement>(null);

  // Load list of field workers
  useEffect(() => {
    setSelectedWorkerId(null);
    fetchWorkers(activeTenantId);
  }, [activeTenantId]);

  // Fetch detailed route when worker or date selection changes
  useEffect(() => {
    if (selectedWorkerId) {
      fetchRouteDetails(selectedWorkerId, selectedDate, activeTenantId);
    } else {
      setWorkerDetails(null);
      setShiftDetails(null);
      setRoutePoints([]);
      resetSimulation();
    }
  }, [selectedWorkerId, selectedDate, activeTenantId]);

  // Auto-scroll coordinate table to highlight active item during replay
  useEffect(() => {
    if (activeRowRef.current && coordinatesTableContainerRef.current) {
      const container = coordinatesTableContainerRef.current;
      const row = activeRowRef.current;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const rowTop = row.offsetTop - container.offsetTop;
      const rowBottom = rowTop + row.clientHeight;

      if (rowTop < containerTop || rowBottom > containerBottom) {
        container.scrollTo({
          top: rowTop - container.clientHeight / 2 + row.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [simulatedIndex]);

  // Simulation loop trigger
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && routePoints.length > 0) {
      timer = setInterval(() => {
        setSimulatedIndex((prev) => {
          if (prev >= routePoints.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, routePoints.length, playbackSpeed]);

  const fetchWorkers = async (tenantId: string) => {
    try {
      setLoadingWorkers(true);
      setError(null);
      const res = await axios.get(`/api/admin/tracking?tenantId=${tenantId}`);
      setWorkers(res.data.workers || []);
      
      if (res.data.workers && res.data.workers.length > 0) {
        setSelectedWorkerId(res.data.workers[0].id);
      } else {
        setSelectedWorkerId(null);
      }
    } catch (err: any) {
      console.error('Failed to load workers:', err);
      setError('Could not fetch field workers status from server.');
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchRouteDetails = async (workerId: string, date: string, tenantId: string) => {
    try {
      setLoadingRoute(true);
      setError(null);
      resetSimulation();
      const res = await axios.get(`/api/admin/tracking?userId=${workerId}&date=${date}&tenantId=${tenantId}`);
      setWorkerDetails(res.data.worker);
      setShiftDetails(res.data.shift);
      setRoutePoints(res.data.route || []);
    } catch (err: any) {
      console.error('Failed to fetch route telemetry:', err);
      setError('Failed to retrieve journey logs for the selected date.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setSimulatedIndex(-1);
  };

  const toggleSimulation = () => {
    if (routePoints.length === 0) return;
    if (simulatedIndex >= routePoints.length - 1) {
      setSimulatedIndex(0);
    } else if (simulatedIndex === -1) {
      setSimulatedIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = () => {
    const speeds = [1, 2, 5, 10];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const getDuration = (start: string, end: string | null) => {
    if (!start) return '--';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : new Date().getTime();
    const diff = endTime - startTime;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getInitials = (name: string) => {
    if (!name) return 'W';
    const pts = name.split(' ');
    if (pts.length > 1) return `${pts[0][0]}${pts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Get active coordinate from route or latest location
  const getActiveLocation = () => {
    if (simulatedIndex >= 0 && simulatedIndex < routePoints.length) {
      return routePoints[simulatedIndex];
    }
    if (routePoints.length > 0) {
      return routePoints[routePoints.length - 1];
    }
    return undefined;
  };

  // Odometer value (simulated vs absolute)
  const getActiveDistance = () => {
    if (!shiftDetails) return 0;
    if (simulatedIndex === -1 || routePoints.length === 0) {
      return shiftDetails.totalDistanceKm;
    }
    let d = 0;
    const limit = Math.min(simulatedIndex, routePoints.length - 1);
    for (let i = 0; i <= limit; i++) {
      d += routePoints[i].distanceFromPrev || 0;
    }
    return Math.round(d * 100) / 100;
  };

  const filteredWorkers = workers.filter(worker => 
    worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8.5rem)] animate-in fade-in duration-500 select-none overflow-hidden relative">
      
      {/* Column 1: Field Workers Sidebar Panel */}
      <section className="w-full lg:w-85 bg-white rounded-[32px] border border-slate-200/60 flex flex-col overflow-hidden shadow-sm h-full shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider font-display">
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            Dispatch Directory
          </h2>
          <span className="bg-indigo-50 text-indigo-755 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg">
            {filteredWorkers.length} Scoped
          </span>
        </div>

        {/* Search filter input */}
        <div className="p-4 border-b border-slate-100/50 shrink-0">
          <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-2">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search field staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold bg-transparent border-none outline-none focus:ring-0 focus:outline-none placeholder-slate-400 font-sans"
            />
          </div>
        </div>

        {/* Workers List container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {loadingWorkers ? (
            <LoadingSkeleton variant="card" />
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="h-8 w-8 mx-auto text-slate-350 mb-2" />
              <p className="text-xs font-bold font-display">No field staff found</p>
            </div>
          ) : (
            filteredWorkers.map((worker) => {
              const isActive = worker.activeShift?.status === 'checked_in';
              const isSelected = worker.id === selectedWorkerId;
              return (
                <button
                  key={worker.id}
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className={`w-full p-4 rounded-[24px] border text-left flex items-center gap-4 transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-indigo-50/40 border-indigo-300 shadow-sm scale-[1.01]'
                      : 'bg-white border-slate-100 hover:bg-slate-50/60'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>

                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black border transition-all duration-300 shrink-0 font-display ${
                    isSelected 
                      ? 'bg-indigo-650 border-indigo-500 text-white shadow-lg shadow-indigo-650/15' 
                      : 'bg-slate-50 border-slate-200/60 text-slate-600 group-hover:scale-105'
                  }`}>
                    {getInitials(worker.fullName)}
                  </div>

                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <h3 className="text-xs font-black text-slate-900 truncate leading-none font-display">{worker.fullName}</h3>
                      {isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate font-semibold">{worker.email}</p>
                    
                    {worker.activeShift && (
                      <p className="text-[9px] text-slate-500 font-mono tracking-tight mt-1 bg-slate-100/50 px-2 py-0.5 rounded-md border border-slate-200/20 w-fit">
                        Today: {worker.activeShift.totalDistanceKm} km ({worker.activeShift.status === 'checked_in' ? 'Active' : 'Ended'})
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Column 2: Live Map Telemetry Dispatch Command Center */}
      <section className="flex-1 bg-white border border-slate-200/60 rounded-[32px] overflow-hidden shadow-sm h-full relative min-w-0">
        
        {/* Full-Height Map Container */}
        <div className="absolute inset-0 z-10">
          {selectedWorkerId && shiftDetails ? (
            <TrackingMap 
              route={routePoints} 
              checkInLocation={shiftDetails.checkInLocation}
              checkOutLocation={shiftDetails.checkOutLocation}
              currentLocation={getActiveLocation()}
              simulating={simulatedIndex >= 0}
            />
          ) : (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Compass className="h-14 w-14 text-slate-800 animate-spin-slow mb-4" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 font-display">SaaS Dispatch Standby</h4>
              <p className="text-[10px] text-slate-600 mt-2 max-w-xs leading-relaxed font-sans">
                Select an employee from the directory and configure a dates filter to plot active GPS travel tracks.
              </p>
            </div>
          )}
        </div>

        {/* OVERLAYS: HUD (Heads-up Display) Elements floating on top of the Map */}
        {selectedWorkerId && (
          <div className="absolute inset-0 z-20 pointer-events-none p-5 flex flex-col justify-between h-full">
            
            {/* Top Row: Date Selector & Live Metrics overlay cards */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
              
              {/* Date Input Box */}
              <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-[24px] p-4 flex items-center gap-3.5 pointer-events-auto">
                <CalendarDays className="h-5 w-5 text-indigo-500 shrink-0" />
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider font-display">Tracking Audit Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      resetSimulation();
                    }}
                    className="block border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shift Stats Card */}
              {shiftDetails && (
                <div className="bg-slate-950/95 border border-slate-900 shadow-2xl rounded-[24px] p-4.5 flex items-center gap-6 pointer-events-auto text-white">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${shiftDetails.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Navigation className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider font-display">Telemetry Status</span>
                      <span className="text-[10px] font-black uppercase block tracking-wide font-mono">
                        {isPlaying ? 'Simulating Playback' : shiftDetails.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-800"></div>

                  {/* Distance */}
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider font-display">Odometer Distance</span>
                    <span className="text-xs font-black font-mono block text-indigo-400">{getActiveDistance()} km</span>
                  </div>

                  <div className="w-px h-8 bg-slate-800"></div>

                  {/* Hours */}
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider font-display">Shift Duration</span>
                    <span className="text-xs font-black font-mono block text-amber-450">{getDuration(shiftDetails.checkInTime, shiftDetails.checkOutTime)}</span>
                  </div>

                  <div className="w-px h-8 bg-slate-800"></div>

                  {/* Checkin Time */}
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider font-display">Shift Start</span>
                    <span className="text-xs font-black font-mono block text-slate-200">{formatTime(shiftDetails.checkInTime)}</span>
                  </div>

                </div>
              )}
            </div>

            {/* Bottom Row: Simulation controls (center) and telemetry timeline coordinates (right) */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 w-full">
              
              {/* Simulation Player Widget (Bottom-Center/Left) */}
              {routePoints.length > 0 && (
                <div className="bg-slate-950/95 border border-slate-900 shadow-2xl rounded-2xl p-4.5 flex items-center gap-4 pointer-events-auto text-white shrink-0">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        onClick={toggleSimulation}
                        className="h-10 w-10 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white active:scale-95 transition-all"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        onClick={resetSimulation}
                        className="h-10 w-10 p-0 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>

                      <Button
                        onClick={handleSpeedChange}
                        className="h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-wider font-mono hover:bg-slate-850 text-indigo-400 active:scale-95 transition-all"
                      >
                        Speed: {playbackSpeed}x
                      </Button>
                    </div>

                    <div className="w-52 h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${((simulatedIndex + 1) / routePoints.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coordinates Feed Drawer (Bottom-Right) */}
              {shiftDetails && routePoints.length > 0 && (
                <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-[28px] p-4.5 w-96 h-60 flex flex-col pointer-events-auto">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 shrink-0 font-display">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
                    Coordinate Telemetry Feed
                  </h3>
                  
                  <div 
                    ref={coordinatesTableContainerRef}
                    className="flex-1 overflow-y-auto border border-slate-100 rounded-xl mt-3 min-h-0 scrollbar-thin"
                  >
                    <table className="w-full text-left border-collapse text-[9px] font-sans">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider font-display">
                        <tr>
                          <th className="py-2 px-2.5">Time</th>
                          <th className="py-2 px-2.5">GPS Position</th>
                          <th className="py-2 px-2.5 text-right">Odo Segment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-slate-650 font-mono">
                        {routePoints.map((pt, idx) => {
                          const isCurrentPoint = idx === simulatedIndex;
                          const isStart = idx === 0;
                          return (
                            <tr 
                              key={pt.id} 
                              ref={isCurrentPoint ? activeRowRef : null}
                              className={`transition-all duration-300 ${
                                isCurrentPoint 
                                  ? 'bg-indigo-50/80 text-indigo-850 font-black border-l-4 border-indigo-600' 
                                  : 'hover:bg-slate-50/50'
                              }`}
                            >
                              <td className="py-2 px-2.5 whitespace-nowrap">{formatTime(pt.timestamp)}</td>
                              <td className="py-2 px-2.5 text-slate-400">
                                {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                              </td>
                              <td className="py-2 px-2.5 text-right font-bold">
                                {isStart ? (
                                  <span className="text-emerald-600 font-display font-black uppercase text-[8px]">Start</span>
                                ) : (
                                  `+${(pt.distanceFromPrev || 0).toFixed(2)} km`
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </section>

    </div>
  );
}

export default function AdminTrackingDashboard() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="table" rows={10} />}>
      <AdminTrackingDashboardContent />
    </Suspense>
  );
}
