'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface Point {
  latitude: number;
  longitude: number;
  timestamp?: string;
  distanceFromPrev?: number;
}

interface TrackingMapProps {
  route: Point[];
  checkInLocation?: { latitude: number; longitude: number; address?: string };
  checkOutLocation?: { latitude: number; longitude: number; address?: string };
  currentLocation?: { latitude: number; longitude: number };
}

export default function TrackingMap({
  route,
  checkInLocation,
  checkOutLocation,
  currentLocation,
}: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Dynamic loader for Leaflet
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Leaflet script');
      setLoadError(true);
    };
    document.body.appendChild(script);
  }, []);

  // Map Initialization and Rendering
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let centerLat = 40.7128;
    let centerLng = -74.0060;

    if (route.length > 0) {
      centerLat = route[Math.floor(route.length / 2)].latitude;
      centerLng = route[Math.floor(route.length / 2)].longitude;
    } else if (checkInLocation) {
      centerLat = checkInLocation.latitude;
      centerLng = checkInLocation.longitude;
    }

    // Initialize Map with clean presets
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([centerLat, centerLng], 14);
    
    mapInstanceRef.current = map;

    // Add clean map tiles (CartoDB Positron - light, sleek, and high-contrast for fleet tracking)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Standard Zoom Control positioned bottom-right to avoid blocking overlay elements
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create high-tech HTML/CSS marker div icons
    const startIcon = L.divIcon({
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full bg-emerald-500/25 sonar-wave"></div>
          <div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold text-[9px]">A</div>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const endIcon = L.divIcon({
      html: `
        <div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute w-6 h-6 rounded-full bg-rose-500/25 sonar-wave"></div>
          <div class="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center text-white font-extrabold text-[9px]">B</div>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const currentIcon = L.divIcon({
      html: `
        <div class="relative w-10 h-10 flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 sonar-wave"></div>
          <div class="absolute w-5 h-5 rounded-full bg-blue-500/40 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      className: 'custom-leaflet-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const checkpointIcon = (idx: number) => L.divIcon({
      html: `<div class="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white shadow"></div>`,
      className: 'custom-leaflet-checkpoint',
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });

    // Plot start point
    const start = checkInLocation || (route.length > 0 ? route[0] : null);
    if (start) {
      L.marker([start.latitude, start.longitude], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<b>Start Check-In</b><br>${start.latitude.toFixed(5)}, ${start.longitude.toFixed(5)}`);
    }

    // Plot check-out
    const end = checkOutLocation || (route.length > 1 ? route[route.length - 1] : null);
    const isCheckedOut = !!checkOutLocation || (route.length > 1 && !currentLocation);
    if (end && isCheckedOut) {
      L.marker([end.latitude, end.longitude], { icon: endIcon })
        .addTo(map)
        .bindPopup(`<b>End Check-Out</b><br>${end.latitude.toFixed(5)}, ${end.longitude.toFixed(5)}`);
    }

    // Plot live worker position
    const curr = currentLocation || (route.length > 0 && !isCheckedOut ? route[route.length - 1] : null);
    if (curr && !isCheckedOut) {
      L.marker([curr.latitude, curr.longitude], { icon: currentIcon })
        .addTo(map)
        .bindPopup(`<b>Live Dispatch Position</b><br>Worker Active On Duty`);
    }

    // Plot intermediate path coordinate dots
    if (route.length > 2) {
      for (let i = 1; i < route.length - 1; i++) {
        L.marker([route[i].latitude, route[i].longitude], { icon: checkpointIcon(i) }).addTo(map);
      }
    }

    // Draw route path line with clean colors
    if (route.length > 0) {
      const latlngs = route.map((p) => [p.latitude, p.longitude]);
      
      // Main glowing shadow line
      L.polyline(latlngs, {
        color: '#6366f1',
        weight: 6,
        opacity: 0.15,
      }).addTo(map);

      // Dash path overlay
      const polyline = L.polyline(latlngs, {
        color: '#4f46e5',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (start) {
      map.setView([start.latitude, start.longitude], 15);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, route, checkInLocation, checkOutLocation, currentLocation]);

  if (loadError || !leafletLoaded) {
    return (
      <div className="w-full h-full bg-slate-950 border border-slate-900 rounded-3xl flex flex-col items-center justify-center p-6 text-center text-slate-400 font-sans relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {!loadError ? (
          <div className="space-y-4 z-10">
            <Compass className="h-12 w-12 text-indigo-500 animate-spin-slow mx-auto" />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300">Loading Telemetry Engine...</h4>
            <p className="text-[10px] text-slate-500 max-w-xs">Initializing OpenStreetMap dispatch tiles</p>
          </div>
        ) : (
          <div className="space-y-4 z-10 w-full max-w-md">
            <MapPin className="h-10 w-10 text-amber-500 mx-auto" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">Schematic Route Fallback</h4>
              <p className="text-[10px] text-slate-500 mt-1">Rendered schematic representation of GPS logs</p>
            </div>
            
            {route.length > 0 ? (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 flex items-center justify-center">
                <svg className="w-48 h-32 text-indigo-500" viewBox="0 0 200 100">
                  {route.map((p, idx) => {
                    const x = 20 + (idx / (route.length - 1 || 1)) * 160;
                    const y = 50 + Math.sin(idx) * 25;
                    return (
                      <g key={idx}>
                        {idx > 0 && (
                          <line 
                            x1={20 + ((idx - 1) / (route.length - 1 || 1)) * 160} 
                            y1={50 + Math.sin(idx - 1) * 25} 
                            x2={x} 
                            y2={y} 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeDasharray="4 4" 
                          />
                        )}
                        <circle cx={x} cy={y} r="4" className={idx === 0 ? 'fill-emerald-500' : idx === route.length - 1 ? 'fill-rose-500' : 'fill-indigo-500'} />
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <p className="text-xs text-slate-600">No shift coordinates logged today.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Sonar Pulse Keyframes Animation Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sonarPulse {
          0% { transform: scale(0.6); opacity: 0.9; }
          50% { opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .sonar-wave {
          animation: sonarPulse 2s infinite ease-out;
        }
      `}} />
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
}
