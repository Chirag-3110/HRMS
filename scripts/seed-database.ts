/**
 * Database Seed Script
 * 
 * Populates MongoDB with dummy data for development and testing under the FieldPulse SaaS multi-tenant design.
 * Sets up System Superadmin, two tenants ('apex-logistics' and 'prime-healthcare'), their administrators,
 * field workers, and custom location logs / attendance records.
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

const adminPasswordHash = hashPassword('Password123!');
const workerPass1Hash = hashPassword('WorkerPass1!');
const workerPass2Hash = hashPassword('WorkerPass2!');

const dummyUsers = [
  // System Superadmin
  {
    email: 'superadmin@fieldpulse.com',
    fullName: 'System Superadmin',
    phoneNumber: '+1 (555) 999-9999',
    role: 'Admin' as const,
    status: 'active' as const,
    password: adminPasswordHash,
    tenantId: 'system',
    registrationDate: new Date('2024-01-01T09:00:00Z'),
    lastLoginDate: new Date(),
  },
  // Apex Logistics: Tenant Admin
  {
    email: 'admin@apex-logistics.com',
    fullName: 'Apex Admin Coordinator',
    phoneNumber: '+1 (555) 100-2000',
    role: 'Admin' as const,
    status: 'active' as const,
    password: adminPasswordHash,
    tenantId: 'apex-logistics',
    registrationDate: new Date('2024-02-10T10:00:00Z'),
    lastLoginDate: new Date(),
  },
  // Apex Logistics: Field Workers
  {
    email: 'worker1@apex-logistics.com',
    fullName: 'Marcus Vance (Driver 1)',
    phoneNumber: '+1 (555) 101-3001',
    role: 'FieldWorker' as const,
    status: 'active' as const,
    password: workerPass1Hash,
    tenantId: 'apex-logistics',
    registrationDate: new Date('2024-02-12T08:30:00Z'),
    lastLoginDate: new Date(),
  },
  {
    email: 'worker2@apex-logistics.com',
    fullName: 'Elena Rostova (Driver 2)',
    phoneNumber: '+1 (555) 101-3002',
    role: 'FieldWorker' as const,
    status: 'active' as const,
    password: workerPass2Hash,
    tenantId: 'apex-logistics',
    registrationDate: new Date('2024-02-15T09:00:00Z'),
    lastLoginDate: new Date(),
  },

  // Prime Healthcare: Tenant Admin
  {
    email: 'admin@prime-healthcare.com',
    fullName: 'Prime Clinical Lead',
    phoneNumber: '+1 (555) 200-2000',
    role: 'Admin' as const,
    status: 'active' as const,
    password: adminPasswordHash,
    tenantId: 'prime-healthcare',
    registrationDate: new Date('2024-03-01T10:00:00Z'),
    lastLoginDate: new Date(),
  },
  // Prime Healthcare: Field Workers
  {
    email: 'worker1@prime-healthcare.com',
    fullName: 'Sarah Jenkins (Nurse 1)',
    phoneNumber: '+1 (555) 201-3001',
    role: 'FieldWorker' as const,
    status: 'active' as const,
    password: workerPass1Hash,
    tenantId: 'prime-healthcare',
    registrationDate: new Date('2024-03-02T08:00:00Z'),
    lastLoginDate: new Date(),
  },
  {
    email: 'worker2@prime-healthcare.com',
    fullName: 'Robert Chen (Nurse 2)',
    phoneNumber: '+1 (555) 201-3002',
    role: 'FieldWorker' as const,
    status: 'active' as const,
    password: workerPass2Hash,
    tenantId: 'prime-healthcare',
    registrationDate: new Date('2024-03-05T09:00:00Z'),
    lastLoginDate: new Date(),
  }
];

// Activity templates
const activityTemplates = [
  { actionType: 'login', description: 'User logged into operational portal' },
  { actionType: 'logout', description: 'User signed out of system' },
  { actionType: 'check_in', description: 'Field worker checked in for shift' },
  { actionType: 'check_out', description: 'Field worker completed duty shift and checked out' },
  { actionType: 'location_sync', description: 'Location tracking telemetry ping synchronized' },
];

// Route for Apex Logistics - Brooklyn/Lower Manhattan delivery loop
const apexRoutePoints = [
  { lat: 40.7128, lng: -74.0060, addr: 'Apex Depot - City Hall, NY' },
  { lat: 40.7150, lng: -74.0030, addr: 'Chinatown Delivery Hub, NY' },
  { lat: 40.7180, lng: -73.9990, addr: 'Lower East Side Logistics, NY' },
  { lat: 40.7220, lng: -73.9960, addr: 'Nolita Transit Center, NY' },
  { lat: 40.7260, lng: -73.9910, addr: 'East Village Sorting Facility, NY' },
  { lat: 40.7300, lng: -73.9850, addr: 'Stuyvesant Delivery Site, NY' },
  { lat: 40.7350, lng: -73.9800, addr: 'Gramercy Park Depot, NY' },
  { lat: 40.7400, lng: -73.9820, addr: 'Flatiron Hub, NY' },
  { lat: 40.7450, lng: -73.9840, addr: 'NoMad Office, NY' },
  { lat: 40.7500, lng: -73.9860, addr: 'Herald Square Delivery, NY' },
  { lat: 40.7580, lng: -73.9855, addr: 'Times Square HQ, NY' },
];

// Route for Prime Healthcare - Manhattan Medical center routing
const primeRoutePoints = [
  { lat: 40.7640, lng: -73.9630, addr: 'Prime Clinical Headquarters, NY' },
  { lat: 40.7655, lng: -73.9590, addr: 'Memorial Sloan Medical Center, NY' },
  { lat: 40.7680, lng: -73.9555, addr: 'Rockefeller Health Wing, NY' },
  { lat: 40.7720, lng: -73.9510, addr: 'Lenox Hill Outpatient Clinic, NY' },
  { lat: 40.7760, lng: -73.9530, addr: 'Central Park West Medical Group, NY' },
  { lat: 40.7810, lng: -73.9480, addr: 'Mount Sinai Wellness Center, NY' },
  { lat: 40.7860, lng: -73.9440, addr: 'Metropolitan Care Plaza, NY' },
  { lat: 40.7890, lng: -73.9390, addr: 'Prime Senior Care Facility, NY' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting FieldPulse SaaS database seed...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing collections...');
    await User.deleteMany({});
    await Activity.deleteMany({});
    await Attendance.deleteMany({});
    await LocationLog.deleteMany({});
    console.log('✓ Existing data cleared');

    // Insert users
    console.log('👥 Creating partitioned users...');
    const users = await User.insertMany(dummyUsers);
    console.log(`✓ Created ${users.length} users with associated tenant IDs`);

    // Find workers specifically
    const driver1 = users.find(u => u.email === 'worker1@apex-logistics.com');
    const driver2 = users.find(u => u.email === 'worker2@apex-logistics.com');
    const nurse1 = users.find(u => u.email === 'worker1@prime-healthcare.com');
    const nurse2 = users.find(u => u.email === 'worker2@prime-healthcare.com');

    // Generate activities for each user with their respective tenantId
    console.log('📝 Creating partitioned activity logs...');
    const activities = [];
    for (const user of users) {
      for (let i = 0; i < 8; i++) {
        const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - i * 4);
        activities.push({
          userId: user._id,
          tenantId: user.tenantId,
          timestamp,
          actionType: template.actionType,
          description: `${user.fullName}: ${template.description}`,
        });
      }
    }
    await Activity.insertMany(activities);
    console.log(`✓ Created ${activities.length} activities`);

    // Generate historical tracking data for field workers
    console.log('🗺️ Generating tracking logs & attendance shifts for Field Workers...');
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Array defining worker shifts to generate
    const workerShifts = [
      { user: driver1, tenantId: 'apex-logistics', dateStr: todayStr, startHour: 9, points: apexRoutePoints },
      { user: driver1, tenantId: 'apex-logistics', dateStr: yesterdayStr, startHour: 8, points: apexRoutePoints },
      { user: driver2, tenantId: 'apex-logistics', dateStr: todayStr, startHour: 10, points: apexRoutePoints },
      
      { user: nurse1, tenantId: 'prime-healthcare', dateStr: todayStr, startHour: 8, points: primeRoutePoints },
      { user: nurse1, tenantId: 'prime-healthcare', dateStr: yesterdayStr, startHour: 9, points: primeRoutePoints },
      { user: nurse2, tenantId: 'prime-healthcare', dateStr: todayStr, startHour: 9, points: primeRoutePoints },
    ];

    for (const { user, tenantId, dateStr, startHour, points } of workerShifts) {
      if (!user) continue;

      const checkInTime = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:00:00Z`);
      const checkOutTime = new Date(`${dateStr}T${String(startHour + 8).padStart(2, '0')}:00:00Z`);

      let totalDistance = 0;

      // Create attendance session
      const attendance = await Attendance.create({
        userId: user._id,
        tenantId,
        checkInTime,
        checkOutTime,
        checkInLocation: {
          latitude: points[0].lat,
          longitude: points[0].lng,
          address: points[0].addr,
        },
        checkOutLocation: {
          latitude: points[points.length - 1].lat,
          longitude: points[points.length - 1].lng,
          address: points[points.length - 1].addr,
        },
        date: dateStr,
        totalDistanceKm: 0,
        status: 'checked_out',
      });

      // Insert location logs
      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        let stepDist = 0;
        if (i > 0) {
          const prevPt = points[i - 1];
          stepDist = calculateDistance(prevPt.lat, prevPt.lng, pt.lat, pt.lng);
          totalDistance += stepDist;
        }

        const logTime = new Date(checkInTime.getTime() + (i * 45 * 60 * 1000)); // Every 45 minutes

        await LocationLog.create({
          userId: user._id,
          tenantId,
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

    // Set Driver 2 and Nurse 2 to currently Checked In (active shift) for today
    console.log('✓ Simulating active checked-in shifts for select workers today...');
    
    // Update driver2
    if (driver2) {
      const activeDriverShift = await Attendance.findOne({ userId: driver2._id, date: todayStr });
      if (activeDriverShift) {
        activeDriverShift.status = 'checked_in';
        activeDriverShift.checkOutTime = undefined;
        activeDriverShift.checkOutLocation = undefined;
        await activeDriverShift.save();
      }
    }

    // Update nurse2
    if (nurse2) {
      const activeNurseShift = await Attendance.findOne({ userId: nurse2._id, date: todayStr });
      if (activeNurseShift) {
        activeNurseShift.status = 'checked_in';
        activeNurseShift.checkOutTime = undefined;
        activeNurseShift.checkOutLocation = undefined;
        await activeNurseShift.save();
      }
    }

    console.log('✓ Successfully created historical and active attendance sessions');
    console.log('\n✅ Database seeded successfully for FieldPulse SaaS!');
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
