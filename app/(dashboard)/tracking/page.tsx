'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  LayoutDashboard
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
      <span className="ml-3 font-black text-[9px] tracking-widest uppercase text-slate-500 mt-4 z-10">Initializing satellite mapping...</span>
    </div>
  ),
});

export default function AdminTrackingDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  // Selected state
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Telemetry details state
  const [workerDetails, setWorkerDetails] = useState<any>(null);
  const [shiftDetails, setShiftDetails] = useState<any>(null);
  const [routePoints, setRoutePoints] = useState<any[]>([]);

  // Loaders and errors
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load list of field workers
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Fetch detailed route when worker or date selection changes
  useEffect(() => {
    if (selectedWorkerId) {
      fetchRouteDetails(selectedWorkerId, selectedDate);
    } else {
      setWorkerDetails(null);
      setShiftDetails(null);
      setRoutePoints([]);
    }
  }, [selectedWorkerId, selectedDate]);

  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      setError(null);
      const res = await axios.get('/api/admin/tracking');
      setWorkers(res.data.workers || []);
      
      if (res.data.workers && res.data.workers.length > 0) {
        setSelectedWorkerId(res.data.workers[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load workers:', err);
      setError('Could not fetch field workers status from server.');
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchRouteDetails = async (workerId: string, date: string) => {
    try {
      setLoadingRoute(true);
      setError(null);
      const res = await axios.get(`/api/admin/tracking?userId=${workerId}&date=${date}`);
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

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)] animate-in fade-in duration-500 select-none overflow-hidden relative">
      
      {/* Column 1: Field Workers Sidebar Panel */}
      <section className="w-full md:w-80 bg-white rounded-[32px] border border-slate-200/60 flex flex-col overflow-hidden shadow-sm h-full shrink-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <Users className="h-4.5 w-4.5 text-indigo-500" />
            Field Dispatch Directory
          </h2>
          <span className="bg-blue-100 text-blue-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
            {workers.length} Total
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingWorkers ? (
            <LoadingSkeleton variant="card" />
          ) : workers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold">No field workers found</p>
            </div>
          ) : (
            workers.map((worker) => {
              const isActive = worker.activeShift?.status === 'checked_in';
              const isSelected = worker.id === selectedWorkerId;
              return (
                <button
                  key={worker.id}
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-blue-50/40 border-blue-300 shadow-sm scale-[1.02]'
                      : 'bg-white border-slate-100 hover:bg-slate-50/80'
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>

                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black border transition-all duration-300 shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/10' 
                      : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:scale-105'
                  }`}>
                    {getInitials(worker.fullName)}
                  </div>

                  <div className="space-y-1 overflow-hidden flex-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <h3 className="text-xs font-black text-slate-900 truncate leading-none">{worker.fullName}</h3>
                      {isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate font-medium">{worker.email}</p>
                    
                    {worker.activeShift && (
                      <p className="text-[9px] text-slate-500 font-mono tracking-tight mt-1">
                        Ride: {worker.activeShift.totalDistanceKm} km ({worker.activeShift.status === 'checked_in' ? 'Active' : 'Offline'})
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
              currentLocation={shiftDetails.status === 'checked_in' && routePoints.length > 0 ? routePoints[routePoints.length - 1] : undefined}
            />
          ) : (
            <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <Compass className="h-14 w-14 text-slate-800 animate-spin-slow mb-4" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Fleet Dispatch Center Standby</h4>
              <p className="text-[10px] text-slate-600 mt-2 max-w-xs leading-relaxed">
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
              <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-2xl p-4 flex items-center gap-3.5 pointer-events-auto">
                <CalendarDays className="h-5 w-5 text-indigo-500 shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Audit Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shift Stats Card */}
              {shiftDetails && (
                <div className="bg-slate-950/95 border border-slate-900 shadow-2xl rounded-2xl p-4 flex items-center gap-6 pointer-events-auto text-white">
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${shiftDetails.status === 'checked_in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Navigation className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Status</span>
                      <span className="text-[10px] font-black uppercase block tracking-wide">{shiftDetails.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-slate-800"></div>

                  {/* Distance */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Odometer</span>
                    <span className="text-xs font-black font-mono block text-blue-400">{shiftDetails.totalDistanceKm} km</span>
                  </div>

                  <div className="w-px h-8 bg-slate-800"></div>

                  {/* Hours */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Active Time</span>
                    <span className="text-xs font-black font-mono block text-amber-400">{getDuration(shiftDetails.checkInTime, shiftDetails.checkOutTime)}</span>
                  </div>

                  <div className="w-px h-8 bg-slate-800"></div>

                  {/* Checkin Time */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">Check-in</span>
                    <span className="text-xs font-black font-mono block">{formatTime(shiftDetails.checkInTime)}</span>
                  </div>

                </div>
              )}
            </div>

            {/* Bottom Row: Logs Table drawer floating on the right */}
            {shiftDetails && routePoints.length > 0 && (
              <div className="flex justify-end w-full">
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-3xl p-4 w-96 h-60 flex flex-col pointer-events-auto">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5 shrink-0">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
                    Coordinate Telemetry Feed
                  </h3>
                  
                  <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl mt-3.5 min-h-0 scrollbar-thin">
                    <table className="w-full text-left border-collapse text-[9px] font-sans">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-2 px-2.5">Time</th>
                          <th className="py-2 px-2.5">GPS Position</th>
                          <th className="py-2 px-2.5 text-right">Odo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-slate-600 font-mono">
                        {routePoints.map((pt, idx) => (
                          <tr key={pt.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2 px-2.5 whitespace-nowrap">{formatTime(pt.timestamp)}</td>
                            <td className="py-2 px-2.5 text-slate-400">
                              {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                            </td>
                            <td className="py-2 px-2.5 text-right font-bold text-slate-800">
                              {pt.distanceFromPrev > 0 ? `+${pt.distanceFromPrev.toFixed(2)}` : 'Start'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </section>

    </div>
  );
}
