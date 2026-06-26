# React Native Integration Guide: Phelbo Go

This guide outlines how to integrate the Phelbo Go REST APIs and real-time WebSocket location tracking inside a **React Native** (or Expo) mobile application.

---

## 1. Authentication & Cookie Management in React Native

NextAuth.js manages sessions using HTTP-only cookies (`next-auth.session-token`). Unlike web browsers, React Native does not manage cookies out-of-the-box in a standard way. 

To persist these secure cookies across app restarts and send them automatically on requests:
1. Use **Axios** with `withCredentials: true`.
2. Install a native cookie manager package to sync Axios with the OS native cookie jar.

### Installation
```bash
npm install axios @react-native-cookies/cookies
```

### Axios Client Setup
```typescript
// api.ts
import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';

const API_URL = 'https://your-domain.com'; // Admin Next.js server URL

export const mobileClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial: forces cookies to be stored/sent
});

// Optional: Manual debug to check if cookies are stored correctly
export const printCookies = async () => {
  const cookies = await CookieManager.get(API_URL);
  console.log('🍪 Stored Cookies:', cookies);
};
```

---

## 2. React Native Tracking Service Implementation

Below is a complete implementation blueprint for the mobile shift dashboard, including login, check-in, check-out, and periodic background tracking.

### A. Background Location Dependencies
To capture locations periodically while the app is in the background:
- **Expo:** `expo-location` and `expo-task-manager`.
- **Bare React Native:** `react-native-geolocation-service` with `react-native-background-actions` (or `react-native-background-timer`).

---

### B. Implementation Code: `TrackingService.ts`

```typescript
// TrackingService.ts
import { mobileClient } from './api';
import io from 'socket.io-client';

let socket: any = null;
let trackingInterval: NodeJS.Timeout | null = null;
const TELEMETRY_SERVER = 'http://192.168.1.100:3002'; // Socket.io server URL

export const TrackingService = {
  // 1. Authenticate employee
  login: async (email, password) => {
    const response = await mobileClient.post('/api/auth/callback/credentials', {
      email,
      password,
      redirect: 'false',
      json: 'true',
    });
    return response.data;
  },

  // 2. Fetch active shift status
  fetchShiftStatus: async () => {
    const response = await mobileClient.get('/api/attendance/status');
    return response.data; // { checkedIn: boolean, shift: object | null }
  },

  // 3. Check-In & Initialize Tracking
  checkIn: async (workerId, latitude, longitude, address) => {
    const response = await mobileClient.post('/api/attendance', {
      latitude,
      longitude,
      address,
    });
    const shift = response.data;

    // Connect WebSockets
    connectSocket(workerId, shift._id);
    
    // Start periodic background logs
    startLocationUpdates(workerId, shift._id);

    return shift;
  },

  // 4. Check-Out & Finalize Shift
  checkOut: async (latitude, longitude, address) => {
    const response = await mobileClient.put('/api/attendance', {
      latitude,
      longitude,
      address,
    });
    
    // Stop intervals and socket connections
    stopLocationUpdates();
    disconnectSocket();

    return response.data;
  },
};

// WebSocket Helpers
function connectSocket(workerId: string, shiftId: string) {
  socket = io(TELEMETRY_SERVER);
  socket.on('connect', () => {
    console.log('📡 Socket connected');
    socket.emit('join_shift', { workerId, shiftId });
  });
}

function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Background Location sync loop (every 15 seconds)
function startLocationUpdates(workerId: string, shiftId: string) {
  if (trackingInterval) clearInterval(trackingInterval);

  trackingInterval = setInterval(async () => {
    // 1. Get location coordinates (simplified navigator implementation)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // 2. Push live update to Socket for live map representation
        if (socket && socket.connected) {
          socket.emit('push_coords', {
            workerId,
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          });
        }

        // 3. Post to database for historical travel mapping & odometer calculations
        try {
          await mobileClient.post('/api/attendance/location', {
            latitude,
            longitude,
          });
        } catch (error) {
          console.error('Failed to log location to DB:', error);
        }
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, 15000); // 15s interval
}

function stopLocationUpdates() {
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }
}
```

---

## 3. React Native UI Component Sample

Here is a simplified React Native component displaying the check-in interface.

```tsx
// ShiftDashboard.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrackingService } from './TrackingService';

export default function ShiftDashboard({ route }) {
  const { workerId } = route.params;
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const status = await TrackingService.fetchShiftStatus();
    setCheckedIn(status.checkedIn);
    if (status.checkedIn) {
      setDistance(status.shift.totalDistanceKm);
    }
  };

  const handleShiftToggle = async () => {
    setLoading(true);
    try {
      if (checkedIn) {
        // Checkout coordinates (e.g. Times Square)
        await TrackingService.checkOut(40.7580, -73.9855, 'Times Square Office');
        setCheckedIn(false);
        setDistance(0);
      } else {
        // Checkin coordinates (e.g. City Hall)
        const shift = await TrackingService.checkIn(workerId, 40.7128, -74.0060, 'City Hall Office');
        setCheckedIn(true);
        setDistance(shift.totalDistanceKm);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phelbo Go Dashboard</Text>
      
      <View style={[styles.statusBox, checkedIn ? styles.bgActive : styles.bgOffline]}>
        <Text style={styles.statusText}>
          {checkedIn ? 'SHIFT IS ACTIVE' : 'SHIFT IS OFFLINE'}
        </Text>
      </View>

      <Text style={styles.odometer}>Distance Covered: {distance.toFixed(2)} km</Text>

      <TouchableOpacity 
        style={[styles.btn, checkedIn ? styles.btnCheckout : styles.btnCheckin]}
        onPress={handleShiftToggle}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{checkedIn ? 'CHECK OUT' : 'CHECK IN'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  statusBox: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20, marginBottom: 20 },
  bgActive: { backgroundColor: '#064e3b' },
  bgOffline: { backgroundColor: '#451a03' },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  odometer: { color: '#94a3b8', fontSize: 16, marginBottom: 40, fontFamily: 'monospace' },
  btn: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center', borderWidth: 4, elevation: 10 },
  btnCheckin: { backgroundColor: '#2563eb', borderColor: '#1e3a8a' },
  btnCheckout: { backgroundColor: '#dc2626', borderColor: '#7f1d1d' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});
```
