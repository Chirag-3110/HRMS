# Phelbo Go: Mobile Client API & WebSocket Specification

This document provides the complete API specifications for the mobile application used by field workers. It details the authentication flow, shift management (check-in/check-out), location telemetry logging, and the recommended WebSocket architecture for real-time tracking.

> [!TIP]
> **React Native Integration**: If you are building the mobile application in React Native (or Expo), please refer to the dedicated [React Native Integration Guide](file:///Users/pawansharma/pawan/techfriends/SDK/phelbo-superadmin/docs/REACT_NATIVE_INTEGRATION.md) for details on secure cookie management, Axios setup, and native geolocation background tracking.

---

## 1. Authentication API

### POST /api/mobile/login
Authenticates a field worker and returns a standard JWT token directly in the JSON response body. This is the recommended login endpoint for React Native mobile clients.

- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "worker1@example.com",
    "password": "password123"
  }
  ```
- **Response Body (Success `200 OK`):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..ey...",
    "user": {
      "id": "65e6a8b1a8f9c2d1e0f09a52",
      "fullName": "David Miller",
      "email": "worker1@example.com",
      "role": "fieldworker"
    }
  }
  ```
- **Response Body (Error `401 Unauthorized`):**
  ```json
  {
    "message": "Invalid email or password"
  }
  ```
- **Response Body (Error `403 Forbidden`):**
  ```json
  {
    "message": "Your account has been deactivated. Contact administration."
  }
  ```

---

### Alternative: POST /api/auth/callback/credentials (Cookie-based, Web clients)
Maintains session state via cookies for standard web clients.

- **Method:** `POST`
- **Request Body:** `{ "email": "worker1@example.com", "password": "password123", "redirect": "false", "json": "true" }`
- **Response Headers:** `Set-Cookie: next-auth.session-token=...`
- **Response Body:** `{ "url": "http://localhost:3000/mobile" }`

---

## 2. Shift Management APIs

All endpoints below require authentication. The session token is transmitted automatically via the HTTP-only `next-auth.session-token` cookie.

### GET /api/attendance/status
Retrieves the worker's active checked-in shift, if any.

- **Method:** `GET`
- **Response Body (Checked-In `200 OK`):**
  ```json
  {
    "checkedIn": true,
    "shift": {
      "id": "65e6a8b1a8f9c2d1e0f09a5b",
      "checkInTime": "2026-06-26T13:40:00.000Z",
      "checkInLocation": {
        "latitude": 40.7128,
        "longitude": -74.006,
        "address": "City Hall, NY"
      },
      "totalDistanceKm": 0
    }
  }
  ```
- **Response Body (Offline `200 OK`):**
  ```json
  {
    "checkedIn": false,
    "shift": null
  }
  ```

---

### POST /api/attendance
Checks in the worker and starts tracking coordinates.

- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "City Hall, NY"
  }
  ```
- **Response Body (Success `201 Created`):**
  ```json
  {
    "_id": "65e6a8b1a8f9c2d1e0f09a5b",
    "userId": "65e6a8b1a8f9c2d1e0f09a52",
    "checkInTime": "2026-06-26T13:40:00.000Z",
    "checkInLocation": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "address": "City Hall, NY"
    },
    "date": "2026-06-26",
    "totalDistanceKm": 0,
    "status": "checked_in",
    "createdAt": "2026-06-26T13:40:00.000Z",
    "updatedAt": "2026-06-26T13:40:00.000Z"
  }
  ```

---

### PUT /api/attendance
Checks out the worker, finalizing total distance traveled.

- **Method:** `PUT`
- **Request Body:**
  ```json
  {
    "latitude": 40.7580,
    "longitude": -73.9855,
    "address": "Times Square, NY"
  }
  ```
- **Response Body (Success `200 OK`):**
  ```json
  {
    "_id": "65e6a8b1a8f9c2d1e0f09a5b",
    "userId": "65e6a8b1a8f9c2d1e0f09a52",
    "checkInTime": "2026-06-26T13:40:00.000Z",
    "checkOutTime": "2026-06-26T17:45:00.000Z",
    "checkInLocation": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "address": "City Hall, NY"
    },
    "checkOutLocation": {
      "latitude": 40.758,
      "longitude": -73.9855,
      "address": "Times Square, NY"
    },
    "date": "2026-06-26",
    "totalDistanceKm": 11.23,
    "status": "checked_out",
    "createdAt": "2026-06-26T13:40:00.000Z",
    "updatedAt": "2026-06-26T17:45:00.000Z"
  }
  ```

---

## 3. Location Telemetry API

### POST /api/attendance/location
Sends a periodic coordinate update. The server automatically computes the segment distance from the previous coordinate using the Haversine formula and increments the shift odometer.

- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "latitude": 40.7150,
    "longitude": -74.0030
  }
  ```
- **Response Body (Success `200 OK`):**
  ```json
  {
    "success": true,
    "logId": "65e6a8b2a8f9c2d1e0f09a5f",
    "distanceFromPrev": 0.354, // Kilometers moved since last node
    "totalDistanceKm": 0.35
  }
  ```

---

## 4. WebSocket Real-Time Tracking Architecture

Because Next.js API routes are serverless/stateless, traditional continuous WebSockets should be run on a dedicated Node.js telemetry server (or using an event broker like Pusher/Ably). Below is the design specification for a **Socket.io** setup.

### A. Telemetry Socket Events Spec

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join_shift` | Client ➔ Server | `{ "workerId": string, "shiftId": string }` | Joins the worker's live tracking room. |
| `push_coords` | Client ➔ Server | `{ "workerId": string, "latitude": number, "longitude": number, "timestamp": string }` | Sends periodic coordinates to the server. |
| `subscribe_tracking` | Admin ➔ Server | `{ "workerId": string }` | Admin subscribes to a specific worker's route feeds. |
| `broadcast_location` | Server ➔ Admin | `{ "workerId": string, "latitude": number, "longitude": number }` | Server relays live coordinates to administrators. |

---

### B. Implementation Blueprint

#### 1. Telemetry Socket Server (Standalone or Custom Server)
```javascript
// server.js (Node.js + Socket.io)
const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log(`📡 Device Connected: ${socket.id}`);

  // 1. Worker joins shift telemetry room
  socket.on('join_shift', ({ workerId, shiftId }) => {
    socket.join(`worker:${workerId}`);
    socket.workerId = workerId;
    console.log(`🟢 Worker ${workerId} joined room`);
  });

  // 2. Worker pushes live coordinates
  socket.on('push_coords', (data) => {
    const { workerId, latitude, longitude, timestamp } = data;
    console.log(`📍 Position from ${workerId}: ${latitude}, ${longitude}`);
    
    // Broadcast live location to administrators listening to this worker
    io.to(`admin-room:${workerId}`).emit('broadcast_location', {
      workerId,
      latitude,
      longitude,
      timestamp
    });
  });

  // 3. Admin joins subscription room
  socket.on('subscribe_tracking', ({ workerId }) => {
    socket.join(`admin-room:${workerId}`);
    console.log(`👨‍💼 Admin subscribed to worker: ${workerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Device Disconnected: ${socket.id}`);
  });
});

server.listen(3002, () => console.log('🚀 Telemetry Server on Port 3002'));
```

#### 2. Mobile App (Client Integration)
```javascript
// Mobile App Code - Periodically pushes coordinates while shift is active
import io from 'socket.io-client';

const socket = io('http://localhost:3002');

// Join shift room on check-in
function onCheckIn(workerId, shiftId) {
  socket.emit('join_shift', { workerId, shiftId });
  
  // Start GPS tracking interval
  setInterval(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = {
        workerId,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        timestamp: new Date().toISOString()
      };
      
      // Send location via WebSocket
      socket.emit('push_coords', coords);
      
      // Back up to HTTP database
      fetch('/api/attendance/location', {
        method: 'POST',
        body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude })
      });
    });
  }, 10000); // Sync every 10s
}
```

#### 3. Admin Dashboard (Real-time updates)
```javascript
// React Admin View - Listens to live coordinate broadcasts without reloading
import { useEffect } from 'react';
import io from 'socket.io-client';

function useLiveTracking(selectedWorkerId, onLocationUpdate) {
  useEffect(() => {
    if (!selectedWorkerId) return;

    const socket = io('http://localhost:3002');
    
    // Subscribe to selected worker's live location feeds
    socket.emit('subscribe_tracking', { workerId: selectedWorkerId });

    socket.on('broadcast_location', (data) => {
      // Callback to update local coordinates on map
      onLocationUpdate(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedWorkerId]);
}
```
