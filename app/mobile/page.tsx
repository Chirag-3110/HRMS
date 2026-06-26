'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  Navigation, 
  LogOut, 
  Activity, 
  Compass, 
  CheckCircle,
  Truck
} from 'lucide-react';
import axios from 'axios';

// Mock path coordinates around Manhattan, NYC for simulator
const mockRoutes = {
  routeA: [
    { name: 'City Hall (Start)', lat: 40.7128, lng: -74.0060 },
    { name: 'Chinatown', lat: 40.7150, lng: -74.0030 },
    { name: 'Lower East Side', lat: 40.7180, lng: -73.9990 },
    { name: 'Nolita', lat: 40.7220, lng: -73.9960 },
    { name: 'East Village', lat: 40.7260, lng: -73.9910 },
    { name: 'Stuyvesant Town', lat: 40.7300, lng: -73.9850 },
    { name: 'Gramercy Park', lat: 40.7350, lng: -73.9800 },
    { name: 'Flatiron District', lat: 40.7400, lng: -73.9820 },
    { name: 'NoMad', lat: 40.7450, lng: -73.9840 },
    { name: 'Herald Square', lat: 40.7500, lng: -73.9860 },
    { name: 'Times Square (End)', lat: 40.7580, lng: -73.9855 },
  ],
  routeB: [
    { name: 'Grand Central (Start)', lat: 40.7527, lng: -73.9772 },
    { name: 'Chrysler Building', lat: 40.7516, lng: -73.9753 },
    { name: 'UN Plaza', lat: 40.7490, lng: -73.9680 },
    { name: 'Midtown East', lat: 40.7550, lng: -73.9680 },
    { name: 'Sutton Place', lat: 40.7580, lng: -73.9620 },
    { name: 'Queensboro Bridge', lat: 40.7620, lng: -73.9600 },
    { name: 'Roosevelt Island (End)', lat: 40.7600, lng: -73.9510 },
  ],
};

export default function MobileDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Shift & location status states
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Never');

  // Loading & action states
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);

  // Stopwatch state
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'routeA' | 'routeB'>('routeA');
  const [simIndex, setSimIndex] = useState(0);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/mobile/login');
    }
  }, [status, router]);

  // Load current attendance status on mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchStatus();
    }
  }, [status]);

  // Handle stopwatch timer
  useEffect(() => {
    if (isCheckedIn && activeShift?.checkInTime) {
      const startTime = new Date(activeShift.checkInTime).getTime();

      timerRef.current = setInterval(() => {
        const now = new Date().getTime();
        const diff = now - startTime;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setElapsedTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }, 1000);
    } else {
      setElapsedTime('00:00:00');
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCheckedIn, activeShift]);

  // Clean up simulator on unmount
  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/attendance/status');
      if (res.data.checkedIn) {
        setIsCheckedIn(true);
        setActiveShift(res.data.shift);
        setTotalDistance(res.data.shift.totalDistanceKm || 0);
        setCurrentCoords(res.data.shift.checkInLocation);
        setLastSyncTime(new Date(res.data.shift.checkInTime).toLocaleTimeString());
      } else {
        setIsCheckedIn(false);
        setActiveShift(null);
        setTotalDistance(0);
        setCurrentCoords(null);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current browser position
  const getGeoLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
        });
      }
    });
  };

  // Check-In Action
  const handleCheckIn = async () => {
    try {
      setIsActionPending(true);
      
      let lat = 40.7128; // Default mock coords (Manhattan Start)
      let lng = -74.0060;
      let address = 'City Hall, NY (GPS Mock)';

      try {
        // Try getting real device location
        const pos = await getGeoLocation();
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        address = 'Real GPS Coordinates';
      } catch (err) {
        console.warn('Real GPS failed, using default mock location points');
      }

      const res = await axios.post('/api/attendance', {
        latitude: lat,
        longitude: lng,
        address,
      });

      setIsCheckedIn(true);
      setActiveShift(res.data);
      setTotalDistance(0);
      setCurrentCoords({ lat, lng });
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error: any) {
      alert(error.response?.data?.message || 'Check-in failed');
    } finally {
      setIsActionPending(false);
    }
  };

  // Check-Out Action
  const handleCheckOut = async () => {
    try {
      setIsActionPending(true);
      
      // Stop simulator if active
      stopSimulation();

      let lat = currentCoords?.lat || 40.7580;
      let lng = currentCoords?.lng || -73.9855;
      let address = 'Checkout GPS Position';

      try {
        const pos = await getGeoLocation();
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        address = 'Real GPS Coordinates';
      } catch (err) {
        console.warn('GPS failed for checkout, using last known coordinate');
      }

      const res = await axios.put('/api/attendance', {
        latitude: lat,
        longitude: lng,
        address,
      });

      setIsCheckedIn(false);
      setActiveShift(null);
      setTotalDistance(res.data.totalDistanceKm || 0);
      setCurrentCoords(null);
      alert(`Shift completed successfully! Total Ride: ${res.data.totalDistanceKm} km`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Check-out failed');
    } finally {
      setIsActionPending(false);
    }
  };

  // Simulator core loop
  const startSimulation = () => {
    if (!isCheckedIn) return;
    
    setIsSimulating(true);
    setSimIndex(0);
    
    const route = mockRoutes[selectedRoute];
    
    // Log the starting point of the route first
    logSimLocation(route[0].lat, route[0].lng);
    setCurrentCoords({ lat: route[0].lat, lng: route[0].lng });

    let index = 1;
    setSimIndex(1);

    simTimerRef.current = setInterval(() => {
      if (index >= route.length) {
        stopSimulation();
        alert('Simulation finished! You have completed the delivery route.');
        return;
      }

      const point = route[index];
      logSimLocation(point.lat, point.lng);
      setCurrentCoords({ lat: point.lat, lng: point.lng });
      
      index++;
      setSimIndex(index);
    }, 4000); // Trigger location sync every 4 seconds
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
  };

  const logSimLocation = async (lat: number, lng: number) => {
    try {
      const res = await axios.post('/api/attendance/location', {
        latitude: lat,
        longitude: lng,
      });
      if (res.data.success) {
        setTotalDistance(res.data.totalDistanceKm);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to log simulated location:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading application...</span>
      </div>
    );
  }

  const routePoints = mockRoutes[selectedRoute];

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center py-6 px-4">
      {/* Device frame container for desktop view, fullscreen on mobile */}
      <div className="w-full max-w-md bg-slate-950 shadow-2xl rounded-[40px] border-[10px] border-slate-800 flex flex-col overflow-hidden aspect-[9/19] h-[850px] relative">
        
        {/* Device Status Bar */}
        <div className="bg-slate-950 px-6 py-2 flex justify-between items-center text-[11px] font-semibold text-slate-400 border-b border-slate-900">
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="w-16 h-4 bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-1.5 flex justify-center items-center">
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
            <span>5G</span>
          </div>
        </div>

        {/* Dashboard Header */}
        <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-sm font-bold text-slate-300">Phelbo Mobile Tracker</h1>
            <p className="text-[10px] text-slate-500 font-medium">Worker: {session?.user?.name}</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => signOut({ callbackUrl: '/mobile/login' })}
            className="text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* Scrollable Panel Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 flex flex-col scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Status Indicator Card */}
          <div className={`p-4 rounded-3xl border transition-all duration-300 ${
            isCheckedIn 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Tracking Status</p>
                <h2 className={`text-lg font-black mt-0.5 ${isCheckedIn ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isCheckedIn ? 'SHIFT IS ACTIVE' : 'SHIFT IS OFFLINE'}
                </h2>
              </div>
              <div className={`p-2.5 rounded-full ${isCheckedIn ? 'bg-emerald-600/20 text-emerald-400' : 'bg-rose-600/20 text-rose-400'}`}>
                <Navigation className={`h-5 w-5 ${isCheckedIn ? 'animate-bounce' : 'rotate-45'}`} />
              </div>
            </div>
          </div>

          {/* Action Shift Button */}
          <div className="flex justify-center py-4 shrink-0">
            <button
              onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
              disabled={isActionPending}
              className={`w-36 h-36 rounded-full font-black text-sm tracking-widest flex flex-col items-center justify-center border-[6px] shadow-2xl transition-all duration-300 active:scale-95 ${
                isCheckedIn
                  ? 'bg-gradient-to-tr from-rose-700 to-rose-500 border-rose-950 hover:to-rose-400 shadow-rose-900/30 text-white'
                  : 'bg-gradient-to-tr from-blue-700 to-blue-500 border-blue-950 hover:to-blue-400 shadow-blue-900/30 text-white'
              }`}
            >
              {isActionPending ? (
                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></span>
              ) : (
                <>
                  <Compass className="h-7 w-7 mb-1.5 animate-spin-slow" />
                  <span>{isCheckedIn ? 'CHECK OUT' : 'CHECK IN'}</span>
                </>
              )}
            </button>
          </div>

          {/* Shift Telemetry Telemetry Info Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Shift Timer</span>
              </div>
              <p className="text-xl font-bold text-white mt-2 font-mono tracking-tight">{elapsedTime}</p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Activity className="h-4 w-4 text-orange-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Distance</span>
              </div>
              <p className="text-xl font-bold text-white mt-2 font-mono tracking-tight">
                {totalDistance.toFixed(2)} <span className="text-xs text-slate-500">km</span>
              </p>
            </div>
          </div>

          {/* Location Details panel */}
          {isCheckedIn && currentCoords && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shrink-0 text-xs">
              <div className="flex justify-between items-center text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-red-500" /> Current Coordinates
                </span>
                <span className="text-[9px]">Synced: {lastSyncTime}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-white font-mono bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[9px] text-slate-500 block">LATITUDE</span>
                  <span className="text-xs font-semibold">{currentCoords.lat.toFixed(5)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">LONGITUDE</span>
                  <span className="text-xs font-semibold">{currentCoords.lng.toFixed(5)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Simulation Dashboard Panel */}
          {isCheckedIn && (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-4 space-y-3.5 flex-1 flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <Truck className="h-4 w-4" /> Travel Journey Simulator
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Simulate your daily travel shift path to log coordinates and calculate distance.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Select Route Pattern</label>
                  <select 
                    value={selectedRoute} 
                    onChange={(e) => setSelectedRoute(e.target.value as any)}
                    disabled={isSimulating}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="routeA">Route A: Downtown Medical run (11 Points)</option>
                    <option value="routeB">Route B: Midtown Diagnostics (7 Points)</option>
                  </select>
                </div>

                {isSimulating && (
                  <div className="bg-slate-950/80 rounded-xl p-2 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400">
                      <span>PROGRESS</span>
                      <span>{simIndex} / {routePoints.length} checkpoints</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${(simIndex / routePoints.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 inline" /> Arrived: {routePoints[simIndex - 1]?.name}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={isSimulating ? stopSimulation : startSimulation}
                className={`w-full font-bold text-xs h-10 rounded-xl shadow-lg transition-all duration-200 ${
                  isSimulating 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Square className="h-3.5 w-3.5 mr-1.5 fill-white" /> Stop Journey Simulation
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 mr-1.5 fill-white" /> Start Journey Simulation
                  </>
                )}
              </Button>
            </div>
          )}

          {!isCheckedIn && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-center flex-1 flex flex-col justify-center items-center space-y-3">
              <MapPin className="h-10 w-10 text-slate-700 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-400">No shift currently active</h3>
              <p className="text-[10px] text-slate-500 max-w-xs">
                To start tracking your vehicle movement and kilometers ridden, log into your shift by clicking the CHECK IN button above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
