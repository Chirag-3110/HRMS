/**
 * Database Seed Script
 * 
 * Populates MongoDB with dummy data for development and testing
 * Includes Users (with hashed passwords), Activities, Attendance, and Location Logs.
 * 
 * Run with: npx tsx scripts/seed-database.ts
 */

import crypto from 'crypto';
import { connectDB, disconnectDB } from '../lib/mongodb';
import { User } from '../lib/models/User';
import { Activity } from '../lib/models/Activity';
import { Attendance } from '../lib/models/Attendance';
import { LocationLog } from '../lib/models/LocationLog';

// Helper to hash password using native crypto SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Distance helper
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const defaultHashedPassword = hashPassword('password123');

const dummyUsers = [
  {
    email: 'admin@phelbo.com',
    fullName: 'Super Admin',
    phoneNumber: '+1 (555) 000-0000',
    role: 'Admin' as const,
    status: 'active' as const,
    password: defaultHashedPassword,
    registrationDate: new Date('2023-12-01T09:00:00Z'),
    lastLoginDate: new Date(),
  },
  {
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    phoneNumber: '+1 (555) 123-4567',
    role: 'Admin' as const,
    status: 'active' as const,
    password: defaultHashedPassword,
    registrationDate: new Date('2024-01-15T10:30:00Z'),
    lastLoginDate: new Date('2024-03-20T14:45:00Z'),
  },
  {
    email: 'jane.smith@example.com',
    fullName: 'Jane Smith',
    phoneNumber: '+1 (555) 234-5678',
    role: 'Member' as const,
    status: 'active' as const,
    password: defaultHashedPassword,
    registrationDate: new Date('2024-02-01T08:00:00Z'),
    lastLoginDate: new Date('2024-03-19T16:20:00Z'),
  },
  {
    email: 'bob.johnson@example.com',
    fullName: 'Bob Johnson',
    role: 'Guest' as const,
    status: 'deactivated' as const,
    password: defaultHashedPassword,
    registrationDate: new Date('2024-01-20T12:15:00Z'),
    lastLoginDate: new Date('2024-02-15T09:30:00Z'),
  },
  {
    email: 'worker1@example.com',
    fullName: 'David Miller',
    phoneNumber: '+1 (555) 901-2345',
    role: 'FieldWorker' as const,
    status: 'active' as const,
    password: defaultHashedPassword,
    registrationDate: new Date('2024-03-01T09:00:00Z'),
    lastLoginDate: new Date(),
  },
  {
    email: 'worker2@example.com',
    fullName: 'Sarah Jenkins',
    phoneNumber: '+1 (555) 012-3456',
    role: 'FieldWorker' as const,
    status: 'active' as const,
    password: defaultHashedPassword,
    registrationDate: new Date('2024-03-05T08:30:00Z'),
    lastLoginDate: new Date(),
  },
];

// Activity templates
const activityTemplates = [
  { actionType: 'login', description: 'User logged in' },
  { actionType: 'logout', description: 'User logged out' },
  { actionType: 'check_in', description: 'Field worker checked in' },
  { actionType: 'check_out', description: 'Field worker checked out' },
  { actionType: 'location_sync', description: 'Location telemetry synchronized' },
];

// Coordinate coordinates for simulating route paths
// Around New York City area
const mockRoutePoints = [
  { lat: 40.7128, lng: -74.0060, addr: 'City Hall, NY' },
  { lat: 40.7150, lng: -74.0030, addr: 'Chinatown, NY' },
  { lat: 40.7180, lng: -73.9990, addr: 'Lower East Side, NY' },
  { lat: 40.7220, lng: -73.9960, addr: 'Nolita, NY' },
  { lat: 40.7260, lng: -73.9910, addr: 'East Village, NY' },
  { lat: 40.7300, lng: -73.9850, addr: 'Stuyvesant Town, NY' },
  { lat: 40.7350, lng: -73.9800, addr: 'Gramercy Park, NY' },
  { lat: 40.7400, lng: -73.9820, addr: 'Flatiron District, NY' },
  { lat: 40.7450, lng: -73.9840, addr: 'NoMad, NY' },
  { lat: 40.7500, lng: -73.9860, addr: 'Herald Square, NY' },
  { lat: 40.7580, lng: -73.9855, addr: 'Times Square, NY' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Activity.deleteMany({});
    await Attendance.deleteMany({});
    await LocationLog.deleteMany({});
    console.log('✓ Existing data cleared');

    // Insert users
    console.log('👥 Creating users...');
    const users = await User.insertMany(dummyUsers);
    console.log(`✓ Created ${users.length} users`);

    // Find our workers
    const worker1 = users.find(u => u.email === 'worker1@example.com');
    const worker2 = users.find(u => u.email === 'worker2@example.com');

    // Generate activities for each user
    console.log('📝 Creating activity logs...');
    const activities = [];
    for (const user of users) {
      for (let i = 0; i < 8; i++) {
        const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - i * 4);
        activities.push({
          userId: user._id,
          timestamp,
          actionType: template.actionType,
          description: template.description,
        });
      }
    }
    await Activity.insertMany(activities);
    console.log(`✓ Created ${activities.length} activities`);

    // Generate historical tracking data for field workers
    console.log('🗺️ Generating tracking data for field workers...');
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const workers = [
      { user: worker1, dateStr: todayStr, startHour: 9 },
      { user: worker1, dateStr: yesterdayStr, startHour: 8 },
      { user: worker2, dateStr: todayStr, startHour: 10 },
      { user: worker2, dateStr: yesterdayStr, startHour: 9 },
    ];

    for (const { user, dateStr, startHour } of workers) {
      if (!user) continue;

      const checkInTime = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00Z`);
      const checkOutTime = new Date(`${dateStr}T${String(startHour + 8).padStart(2, '0')}:00:00Z`);

      // Calculate path points
      const points = [];
      let totalDistance = 0;

      // Create attendance session
      const attendance = await Attendance.create({
        userId: user._id,
        checkInTime,
        checkOutTime,
        checkInLocation: {
          latitude: mockRoutePoints[0].lat,
          longitude: mockRoutePoints[0].lng,
          address: mockRoutePoints[0].addr,
        },
        checkOutLocation: {
          latitude: mockRoutePoints[mockRoutePoints.length - 1].lat,
          longitude: mockRoutePoints[mockRoutePoints.length - 1].lng,
          address: mockRoutePoints[mockRoutePoints.length - 1].addr,
        },
        date: dateStr,
        totalDistanceKm: 0, // Will calculate and update
        status: 'checked_out',
      });

      // Insert location logs
      for (let i = 0; i < mockRoutePoints.length; i++) {
        const pt = mockRoutePoints[i];
        let stepDist = 0;
        if (i > 0) {
          const prevPt = mockRoutePoints[i - 1];
          stepDist = calculateDistance(prevPt.lat, prevPt.lng, pt.lat, pt.lng);
          totalDistance += stepDist;
        }

        const logTime = new Date(checkInTime.getTime() + (i * 45 * 60 * 1000)); // Every 45 minutes

        await LocationLog.create({
          userId: user._id,
          attendanceId: attendance._id,
          latitude: pt.lat,
          longitude: pt.lng,
          timestamp: logTime,
          distanceFromPrev: stepDist,
        });
      }

      // Update total distance in attendance
      attendance.totalDistanceKm = Math.round(totalDistance * 100) / 100;
      await attendance.save();
    }

    console.log('✓ Created historical attendance and location log records');
    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
